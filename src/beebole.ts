import axios, { AxiosInstance } from "axios";

export interface BeeboleTimeEntry {
  id?: string;
  date: string;
  project_id?: string;
  task_id?: string;
  absence_id?: string;
  hours: number;
  comment?: string;
}

export class BeeboleClient {
  private client: AxiosInstance;
  private baseUrl = "https://beebole-apps.com/api/v2";

  constructor(token: string) {
    const auth = Buffer.from(`${token}:x`).toString("base64");
    this.client = axios.create({
      baseURL: this.baseUrl,
      timeout: 15000, // 15 seconds timeout
      headers: {
        Authorization: `Basic ${auth}`,
        "Content-Type": "application/json",
      },
    });
  }

  private async callService<T>(service: string, params: any = {}): Promise<T> {
    const payloads = [{ service, ...params }, { service, parameters: params }];
    let lastError: Error | null = null;

    for (const payload of payloads) {
      try {
        const response = await this.client.post("", payload);
        if (response.data.status === "ok") return response.data;
        
        // Beebole sometimes returns 200 OK but with status: "error" in the body
        if (response.data.status === "error") {
          const msg = response.data.error?.message || response.data.message || "Unknown Beebole API error";
          throw new Error(msg);
        }
      } catch (error: any) {
        lastError = error;
        // If it's a 401 or 403, no need to retry with second payload
        if (error.response?.status === 401 || error.response?.status === 403) break;
      }
    }

    const errorDetails = lastError instanceof Error ? lastError.message : "Service failed";
    console.error(`[Beebole API Error] Service: ${service}, Details: ${errorDetails}`);
    throw new Error(`Beebole API call failed: ${errorDetails}`);
  }

  private normalize(items: any[]): any[] {
    return items.map(item => ({
      ...item,
      id: String(item.id),
      companyId: item.companyId ? String(item.companyId) : (item.company?.id ? String(item.company.id) : undefined),
      projectId: item.projectId ? String(item.projectId) : (item.project?.id ? String(item.project.id) : undefined),
      subprojectId: item.subprojectId ? String(item.subprojectId) : (item.subproject?.id ? String(item.subproject.id) : undefined)
    }));
  }

  async listCompanies(): Promise<any[]> {
    const data = await this.callService<any>("company.list");
    return this.normalize(data.companies || data.results || []).filter(c => c.active !== false);
  }

  async listProjects(companyIds?: string[]): Promise<any[]> {
    let allProjects: any[] = [];
    if (companyIds && companyIds.length > 0) {
      for (const id of companyIds) {
        try {
          const data = await this.callService<any>("project.list", { company: { id: Number(id) } });
          allProjects.push(...this.normalize(data.projects || data.results || []));
        } catch (e) {}
      }
    }
    return allProjects.filter(p => p.active !== false);
  }

  async listSubprojects(projectIds?: string[]): Promise<any[]> {
    let allSubprojects: any[] = [];
    if (projectIds && projectIds.length > 0) {
      for (const id of projectIds) {
        try {
          const data = await this.callService<any>("subproject.list", { project: { id: Number(id) } });
          allSubprojects.push(...this.normalize(data.subprojects || data.results || []));
        } catch (e) {}
      }
    }
    return allSubprojects.filter(s => s.active !== false);
  }

  async listTasks(): Promise<any[]> {
    try {
      const data = await this.callService<any>("task.list");
      return this.normalize(data.tasks || data.results || []).filter(t => t.active !== false);
    } catch (error) { return []; }
  }

  async listAbsenceTypes(companyIds?: string[]): Promise<any[]> {
    let allAbsences: any[] = [];
    if (companyIds && companyIds.length > 0) {
      for (const id of companyIds) {
        try {
          const data = await this.callService<any>("absence.list", { company: { id: Number(id) } });
          allAbsences.push(...this.normalize(data.absences || data.results || []));
        } catch (e) {}
      }
    }
    return allAbsences.filter(a => a.active !== false);
  }

  async getTimeEntries(startDate: string, endDate: string): Promise<any[]> {
    const data = await this.callService<any>("time_entry.list", { from: startDate, to: endDate });
    return data.timeEntries || data.results || data.time_entries || [];
  }

  async createTimeEntry(entry: BeeboleTimeEntry): Promise<any> {
    const existingEntries = await this.getTimeEntries(entry.date, entry.date);
    
    const existingEntry = existingEntries.find(e => {
      if (entry.absence_id) {
        return String(e.absence?.id) === String(entry.absence_id);
      }
      const target_id = String(entry.project_id);
      const matchProject = String(e.subproject?.id) === target_id || String(e.project?.id) === target_id || String(e.company?.id) === target_id;
      if (matchProject) {
        const e_task_id = e.task?.id ? String(e.task.id) : null;
        const target_task_id = entry.task_id ? String(entry.task_id) : null;
        return !target_task_id || (e_task_id === target_task_id);
      }
      return false;
    });

    const isUpdate = !!existingEntry;
    const service = isUpdate ? "time_entry.update" : "time_entry.create";
    
    const payload: any = { service, date: entry.date, hours: entry.hours, comment: entry.comment };
    if (isUpdate) payload.id = existingEntry.id;

    if (entry.absence_id) {
      payload.absence = { id: Number(entry.absence_id) };
    } else {
      const companies = await this.listCompanies();
      const projects = await this.listProjects(companies.map(c => c.id));
      const isProject = projects.some(p => String(p.id) === String(entry.project_id));
      if (isProject) payload.project = { id: Number(entry.project_id) };
      else payload.subproject = { id: Number(entry.project_id) };
      if (entry.task_id) payload.task = { id: Number(entry.task_id) };
    }

    try {
      const data = await this.callService<any>(service, payload);
      return data;
    } catch (e) {
      if (!entry.absence_id) {
        const retryPayload = { ...payload, company: { id: Number(entry.project_id) } };
        delete retryPayload.subproject; delete retryPayload.project;
        return this.callService<any>(service, retryPayload);
      }
      throw e;
    }
  }
}

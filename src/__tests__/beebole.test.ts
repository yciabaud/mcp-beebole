import { describe, it, expect, vi, beforeEach } from 'vitest';
import axios from 'axios';
import { BeeboleClient } from '../beebole.js';

vi.mock('axios');

describe('BeeboleClient', () => {
  let client: BeeboleClient;
  const mockedAxios = axios as any;

  beforeEach(() => {
    vi.resetAllMocks();
    mockedAxios.create = vi.fn(() => mockedAxios);
    client = new BeeboleClient('fake-token');
    
    // Default mock implementation for post
    mockedAxios.post.mockImplementation(async (url: string, payload: any) => {
      if (payload.service === 'company.list') {
        return { data: { status: 'ok', companies: [{ id: 1, name: 'Company A', active: true }] } };
      }
      if (payload.service === 'project.list') {
        return { data: { status: 'ok', projects: [{ id: 101, name: 'Project X', companyId: 1, active: true }] } };
      }
      if (payload.service === 'time_entry.list') {
        return { data: { status: 'ok', results: [] } };
      }
      if (payload.service === 'time_entry.create') {
        return { data: { status: 'ok', timeEntry: { id: 999, status: 'd' } } };
      }
      if (payload.service === 'time_entry.update') {
        return { data: { status: 'ok', timeEntry: { id: 999, status: 's' } } };
      }
      return { data: { status: 'ok' } };
    });
  });

  it('should list companies and filter active ones', async () => {
    const companies = await client.listCompanies();
    expect(companies).toHaveLength(1);
    expect(companies[0].name).toBe('Company A');
  });

  it('should create a time entry (new)', async () => {
    const result = await client.createTimeEntry({
      date: '2026-04-07',
      project_id: '101',
      hours: 8,
      comment: 'Testing'
    });

    expect(result.timeEntry.id).toBe(999);
  });

  it('should update an existing time entry', async () => {
    // Override list to return one entry
    mockedAxios.post.mockImplementation(async (url: string, payload: any) => {
      if (payload.service === 'time_entry.list') {
        return { data: { status: 'ok', results: [{ id: 999, date: '2026-04-07', project: { id: 101 } }] } };
      }
      if (payload.service === 'time_entry.update') {
        return { data: { status: 'ok', timeEntry: { id: 999, status: 's' } } };
      }
      return { data: { status: 'ok' } };
    });

    const result = await client.createTimeEntry({
      date: '2026-04-07',
      project_id: '101',
      hours: 4
    });

    expect(result.timeEntry.id).toBe(999);
    expect(mockedAxios.post).toHaveBeenCalledWith('', expect.objectContaining({
      service: 'time_entry.update',
      id: 999
    }));
  });

  it('should handle API errors', async () => {
    mockedAxios.post.mockResolvedValue({
      data: { status: 'error', message: 'Unauthorized' }
    });

    await expect(client.listCompanies()).rejects.toThrow('Unauthorized');
  });
});

const request = require('supertest');
jest.mock('axios');

let axios;

describe('API endpoints', () => {
  let app;
  let mockGet;

  beforeEach(() => {
    jest.resetModules();
    process.env.COC_API_KEY = 'test';
    process.env.CLAN_TAG = 'CLAN';
    axios = require('axios');
    mockGet = jest.fn();
    axios.create.mockReturnValue({ get: mockGet });
    app = require('../server');
  });

  test('GET /api/cwl aggregates town halls', async () => {
    mockGet.mockResolvedValueOnce({
      data: {
        clans: [
          {
            name: 'ClanA',
            members: [
              { townHallLevel: 10 },
              { townHallLevel: 11 },
              { townHallLevel: 11 }
            ]
          },
          {
            name: 'ClanB',
            members: [
              { townHallLevel: 10 },
              {}
            ]
          }
        ]
      }
    });

    const res = await request(app).get('/api/cwl');
    expect(res.status).toBe(200);
    expect(res.body).toEqual({
      '10': { ClanA: 1, ClanB: 1 },
      '11': { ClanA: 2 },
      Unknown: { ClanB: 1 }
    });
  });

  test('GET /api/cwl/group returns league group', async () => {
    mockGet.mockResolvedValueOnce({ data: { my: 'group' } });

    const res = await request(app).get('/api/cwl/group');
    expect(res.status).toBe(200);
    expect(res.body).toEqual({ my: 'group' });
  });

  test('GET /api/cwl/war/:index returns war data', async () => {
    mockGet
      .mockResolvedValueOnce({ data: { rounds: [{ warTag: 'WARTAG' }] } })
      .mockResolvedValueOnce({ data: { war: 'data' } });

    const res = await request(app).get('/api/cwl/war/1');
    expect(mockGet).toHaveBeenCalledTimes(2);
    expect(res.status).toBe(200);
    expect(res.body).toEqual({ war: 'data' });
  });

  test('GET /api/clan/:tag returns clan data', async () => {
    mockGet.mockResolvedValueOnce({ data: { clan: 'info' } });

    const res = await request(app).get('/api/clan/123');
    expect(res.status).toBe(200);
    expect(res.body).toEqual({ clan: 'info' });
  });

  test('GET /api/clan/:tag/warlog returns warlog data', async () => {
    mockGet.mockResolvedValueOnce({ data: { log: 'info' } });

    const res = await request(app).get('/api/clan/123/warlog');
    expect(res.status).toBe(200);
    expect(res.body).toEqual({ log: 'info' });
  });

  test('GET /api/cwl/missing lists missing members', async () => {
    mockGet
      .mockResolvedValueOnce({
        data: {
          clans: [
            {
              tag: 'TAG1',
              name: 'Clan1',
              members: [
                { name: 'Alice', tag: 'AAA', townHallLevel: 10 },
                { name: 'Bob', tag: 'BBB', townHallLevel: 9 }
              ]
            }
          ]
        }
      })
      .mockResolvedValueOnce({
        data: {
          memberList: [{ tag: 'AAA' }]
        }
      });

    const res = await request(app).get('/api/cwl/missing');
    expect(res.status).toBe(200);
    expect(res.body).toEqual({
      missing: [{ name: 'Bob', tag: 'BBB', clan: 'Clan1', th: 9 }]
    });
  });
});

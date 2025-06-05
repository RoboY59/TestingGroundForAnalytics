const request = require('supertest');
const nock = require('nock');

let app;

beforeAll(() => {
  Object.keys(process.env)
    .filter((k) => k.toLowerCase().includes('proxy'))
    .forEach((k) => delete process.env[k]);
  nock.disableNetConnect();
  nock.enableNetConnect('127.0.0.1');
  process.env.COC_API_KEY = 'test';
  process.env.CLAN_TAG = 'TESTCLAN';
  app = require('../server');
});

afterEach(() => {
  nock.cleanAll();
});

afterAll(() => {
  nock.enableNetConnect();
});

describe('API endpoints', () => {
  const base = 'https://cocproxy.royaleapi.dev';
  const getClanTag = () => encodeURIComponent('#' + process.env.CLAN_TAG);

  test('GET /api/cwl returns aggregated table', async () => {
    const leagueGroup = {
      clans: [
        { name: 'ClanA', members: [{ townHallLevel: 10 }, { townHallLevel: 12 }] },
        { name: 'ClanB', members: [{ townHallLevel: 10 }, { townHallLevel: 10 }] }
      ]
    };
    nock(base)
      .get(`/v1/clans/${getClanTag()}/currentwar/leaguegroup`)
      .reply(200, leagueGroup);

    const res = await request(app).get('/api/cwl');
    expect(res.status).toBe(200);
    expect(res.body).toEqual({
      '10': { ClanA: 1, ClanB: 2 },
      '12': { ClanA: 1 }
    });
  });

  test('GET /api/cwl/group returns league group', async () => {
    const group = { foo: 'bar' };
    nock(base)
      .get(`/v1/clans/${getClanTag()}/currentwar/leaguegroup`)
      .reply(200, group);

    const res = await request(app).get('/api/cwl/group');
    expect(res.status).toBe(200);
    expect(res.body).toEqual(group);
  });

  test('GET /api/cwl/war/:index returns war data', async () => {
    const group = { rounds: [{ warTag: '#AAA' }] };
    const warData = { some: 'data' };
    nock(base)
      .get(`/v1/clans/${getClanTag()}/currentwar/leaguegroup`)
      .reply(200, group);
    nock(base)
      .get(`/v1/clanwarleagues/wars/%23AAA`)
      .reply(200, warData);

    const res = await request(app).get('/api/cwl/war/1');
    expect(res.status).toBe(200);
    expect(res.body).toEqual(warData);
  });

  test('GET /api/clan/:tag returns clan data', async () => {
    const data = { ok: true };
    nock(base)
      .get('/v1/clans/%23TAG')
      .reply(200, data);

    const res = await request(app).get('/api/clan/TAG');
    expect(res.status).toBe(200);
    expect(res.body).toEqual(data);
  });

  test('GET /api/clan/:tag/warlog returns log', async () => {
    const log = { items: [] };
    nock(base)
      .get('/v1/clans/%23TAG/warlog')
      .reply(200, log);

    const res = await request(app).get('/api/clan/TAG/warlog');
    expect(res.status).toBe(200);
    expect(res.body).toEqual(log);
  });

  test('GET /api/cwl/missing returns missing players', async () => {
    const leagueGroup = {
      clans: [
        {
          name: 'ClanA',
          tag: 'CLANA',
          members: [{ name: 'Bob', tag: 'P1', townHallLevel: 10 }]
        }
      ]
    };
    const clanData = { memberList: [] };
    nock(base)
      .get(`/v1/clans/${getClanTag()}/currentwar/leaguegroup`)
      .reply(200, leagueGroup);
    nock(base)
      .get('/v1/clans/CLANA')
      .reply(200, clanData);

    const res = await request(app).get('/api/cwl/missing');
    expect(res.status).toBe(200);
    expect(res.body).toEqual({
      missing: [
        { name: 'Bob', tag: 'P1', clan: 'ClanA', th: 10 }
      ]
    });
  });

  test('GET /api/cwl/war/:index returns 400 for invalid index', async () => {
    const res = await request(app).get('/api/cwl/war/0');
    expect(res.status).toBe(400);
    expect(res.body).toEqual({ error: 'Ungültiger Index' });
  });

  test('GET /api/cwl/war/:index returns 404 when index is too high', async () => {
    const group = { rounds: [{ warTag: '#AAA' }] };
    nock(base)
      .get(`/v1/clans/${getClanTag()}/currentwar/leaguegroup`)
      .reply(200, group);

    const res = await request(app).get('/api/cwl/war/2');
    expect(res.status).toBe(404);
    expect(res.body).toEqual({ error: 'Kriegstag nicht gefunden oder Clan-Tag falsch.' });
  });

  test('GET /api/cwl/war/:index returns 404 when war not found', async () => {
    const group = { rounds: [{ warTag: '#AAA' }] };
    nock(base)
      .get(`/v1/clans/${getClanTag()}/currentwar/leaguegroup`)
      .reply(200, group);
    nock(base)
      .get('/v1/clanwarleagues/wars/%23AAA')
      .reply(404);

    const res = await request(app).get('/api/cwl/war/1');
    expect(res.status).toBe(404);
    expect(res.body).toEqual({ error: 'Kriegstag nicht gefunden oder Clan-Tag falsch.' });
  });
});

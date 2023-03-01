import http from 'k6/http';
import { check, group, sleep } from 'k6';
//import { htmlReport } from 'https://raw.githubusercontent.com/benc-uk/k6-reporter/main/dist/bundle.js';

export const options = {
  stages: [
    { duration: '30s', target: 1 }, // simulate ramp-up of traffic from 1 to 100 users over 5 minutes.
    { duration: '30s', target: 1 }, // stay at 100 users for 10 minutes
    { duration: '30s', target: 0 }, // ramp-down to 0 users
  ],
  thresholds: {
    http_req_duration: ['p(99)<1500'], // 99% of requests must complete below 1.5s
    //'logged in successfully': ['p(99)<1500'], // 99% of requests must complete below 1.5s
  },
};

const BASE_URL = 'https://services.kredete.dev';
const USERNAME = 'horiola@kredete.com';
const PASSWORD = '#Passw0rd1';
const BASE = 'https://identity.kredete.dev';

export default () => {
  const loginRes = http.post(`${BASE}/connect/token`, {
    username: USERNAME,
    password: PASSWORD,
  });

  check(loginRes, {
    'logged in successfully': (resp) => resp.json('access') !== '',
  });

  /* const authHeaders = {
    headers: {
      Authorization: `Bearer ${loginRes.json('access')}`,
    },
  }; */

  const authHeaders = {
    headers: {
      Authorization: `Bearer ${loginRes.json('access')}`,
    },
  };

  //const myObjects = http.get(`${BASE_URL}/users`, authHeaders).json();

  const myObjects = http.get(`${BASE_URL}/users`, authHeaders).json();
  check(myObjects, { 'retrieved users': (obj) => obj.length > 0 });

  sleep(1);
};

/* export function handleSummary(data) {
  return {
    'summary.html': htmlReport(data),
  };
} */

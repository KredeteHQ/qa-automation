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

const ACCESS_TOKEN_ACQUISITION_PAYLOAD = {
  username: USERNAME,
  password: PASSWORD,
  grant_type: "password",
  client_id: "KredeteAdminAngularClient",
  client_secret: "F621F470-9731-4A25-80EF-67A6F7C5F4B8",
  scope: "KredeteNodeApi KredetePyApi openid profile offline_access"
}

export default async () => {
  let authorizationResponse = await http.post(`${BASE}/connect/token`, ACCESS_TOKEN_ACQUISITION_PAYLOAD);
  let responseBody = await authorizationResponse.json();

  check(responseBody, {
    'logged in successfully': (resp) => resp['access_token'] !== '',
  });

  // get access token from response
  let accessToken = responseBody["access_token"];

  const options = {
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
  };

  // Test users endpoint
  const getAllUsersReq = await http.get(`${BASE_URL}/users`, options);
  let body = await getAllUsersReq.json();

  console.log(body);

  check(body.data, { 'retrieved users': (users) => users.length > 0 });

  sleep(1);
};

/* export function handleSummary(data) {
  return {
    'summary.html': htmlReport(data),
  };
} */

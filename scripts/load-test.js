import http from 'k6/http';
import { check, sleep } from 'k6';
import { Rate } from 'k6/metrics';

const failRate = new Rate('failed_requests');

export const options = {
  stages: [
    { duration: '30s', target: 20 },
    { duration: '30s', target: 50 },
    { duration: '30s', target: 100 },
    { duration: '10s', target: 0 },
  ],
  thresholds: {
    http_req_failed: ['rate<0.01'],
    http_req_duration: ['p(95)<500'],
    failed_requests: ['rate<0.05'],
  },
};

// __ENV is a k6 global — eslint doesn't know about it
const BASE = __ENV?.API_URL || 'http://localhost:8080'; // eslint-disable-line no-undef
const LAWYER_NAME = __ENV?.LAWYER_NAME || 'Test Lawyer'; // eslint-disable-line no-undef

export function setup() {
  // health check
  const res = http.get(`${BASE}/api/health`);
  check(res, { 'health ok': (r) => r.status === 200 });
}

export default function () {
  const payload = JSON.stringify({
    lawyerName: LAWYER_NAME,
    lawyerAvatar: '',
    lawyerGradient: 'from-[#D4AF37] to-[#8c7324]',
    specialization: 'Criminal',
    date: new Date(Date.now() + 86400000).toISOString().split('T')[0],
    time: '10:00',
    duration: 45,
    mode: 'online',
    caseType: 'Criminal',
    notes: 'k6 load test',
    fee: 1500,
  });
  const headers = { 'Content-Type': 'application/json' };
  const res = http.post(`${BASE}/api/appointments`, payload, { headers });
  const ok = check(res, {
    '201 or 409 (slot taken)': (r) => r.status === 201 || r.status === 409,
  });
  failRate.add(!ok);
  if (res.status === 409) {
    check(res, { '409 has slot_taken': (r) => r.json('error') === 'slot_taken' });
  }
  sleep(0.5);
}

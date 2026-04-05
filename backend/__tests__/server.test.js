const request = require("supertest");
const app = require("../server");

// ── UAT 1: Group Creation ─────────────────────────────────────────────────────
// Story: As an Admin, I want to create a stokvel group so that members can be onboarded.
describe("POST /groups - Create a group", () => {
  test("GIVEN a valid group name, WHEN I POST /groups, THEN a new group is created", async () => {
    const res = await request(app)
      .post("/groups")
      .send({ name: "Savings Circle" });

    expect(res.statusCode).toBe(201);
    expect(res.body.name).toBe("Savings Circle");
    expect(res.body.members).toEqual([]);
  });

  test("GIVEN no group name, WHEN I POST /groups, THEN I receive a 400 error", async () => {
    const res = await request(app)
      .post("/groups")
      .send({});

    expect(res.statusCode).toBe(400);
    expect(res.body.error).toBeDefined();
  });
});

// ── UAT 2: Join a Group ───────────────────────────────────────────────────────
// Story: As a Member, I want to join a stokvel group so that I can participate.
describe("POST /groups/:id/join - Join a group", () => {
  let groupId;

  beforeEach(async () => {
    const res = await request(app)
      .post("/groups")
      .send({ name: "Test Group" });
    groupId = res.body.id;
  });

  test("GIVEN a valid group and member name, WHEN I join, THEN the member appears in the group", async () => {
    const res = await request(app)
      .post(`/groups/${groupId}/join`)
      .send({ name: "Thabo" });

    expect(res.statusCode).toBe(200);
    expect(res.body.members).toContain("Thabo");
  });

  test("GIVEN a non-existent group, WHEN I try to join, THEN I receive a 404 error", async () => {
    const res = await request(app)
      .post("/groups/9999/join")
      .send({ name: "Thabo" });

    expect(res.statusCode).toBe(404);
  });
});

// ── UAT 3: Log a Contribution ─────────────────────────────────────────────────
// Story: As a Member, I want to log a contribution so that my payment is recorded.
describe("POST /groups/:id/contributions - Log a contribution", () => {
  let groupId;

  beforeEach(async () => {
    const res = await request(app)
      .post("/groups")
      .send({ name: "Contribution Test Group" });
    groupId = res.body.id;
  });

  test("GIVEN valid member and amount, WHEN I POST a contribution, THEN it is saved as pending", async () => {
    const res = await request(app)
      .post(`/groups/${groupId}/contributions`)
      .send({ memberName: "Lerato", amount: 500 });

    expect(res.statusCode).toBe(201);
    expect(res.body.memberName).toBe("Lerato");
    expect(res.body.amount).toBe(500);
    expect(res.body.status).toBe("pending");
  });

  test("GIVEN a missing amount, WHEN I POST a contribution, THEN I receive a 400 error", async () => {
    const res = await request(app)
      .post(`/groups/${groupId}/contributions`)
      .send({ memberName: "Lerato" });

    expect(res.statusCode).toBe(400);
  });
});

// ── UAT 4: Confirm or Flag a Contribution ────────────────────────────────────
// Story: As a Treasurer, I want to confirm or flag a contribution so the record stays accurate.
describe("PATCH /groups/:id/contributions/:cid - Update contribution status", () => {
  let groupId;
  let contributionId;

  beforeEach(async () => {
    const groupRes = await request(app)
      .post("/groups")
      .send({ name: "Treasurer Group" });
    groupId = groupRes.body.id;

    const contribRes = await request(app)
      .post(`/groups/${groupId}/contributions`)
      .send({ memberName: "Sipho", amount: 300 });
    contributionId = contribRes.body.id;
  });

  test("GIVEN a valid status, WHEN I PATCH the contribution, THEN the status is updated", async () => {
    const res = await request(app)
      .patch(`/groups/${groupId}/contributions/${contributionId}`)
      .send({ status: "confirmed" });

    expect(res.statusCode).toBe(200);
    expect(res.body.status).toBe("confirmed");
  });

  test("GIVEN an invalid status, WHEN I PATCH the contribution, THEN I receive a 400 error", async () => {
    const res = await request(app)
      .patch(`/groups/${groupId}/contributions/${contributionId}`)
      .send({ status: "invalid_status" });

    expect(res.statusCode).toBe(400);
  });
});

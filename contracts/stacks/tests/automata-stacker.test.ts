import { Cl } from "@stacks/transactions";
import { describe, expect, it, beforeEach } from "vitest";

const accounts  = simnet.getAccounts();
const deployer  = accounts.get("deployer")!;
const wallet1   = accounts.get("wallet_1")!;
const wallet2   = accounts.get("wallet_2")!;

const CONTRACT = "automata-stacker";

// dummy bitcoin reward address: version 0x00, 32-byte hashbytes
const poxAddr = Cl.tuple({
  version:   Cl.bufferFromHex("00"),
  hashbytes: Cl.bufferFromHex("11".repeat(32)),
});

describe("automata-stacker", () => {
  describe("enroll", () => {
    it("enrolls a new user and updates totals", () => {
      const r = simnet.callPublicFn(
        CONTRACT, "enroll",
        [Cl.uint(1_000_000), poxAddr],
        wallet1,
      );
      expect(r.result).toBeOk(Cl.bool(true));

      const total = simnet.callReadOnlyFn(CONTRACT, "get-total-delegated", [], deployer);
      expect(total.result).toBeUint(1_000_000);

      const count = simnet.callReadOnlyFn(CONTRACT, "get-enrolled-count", [], deployer);
      expect(count.result).toBeUint(1);
    });

    it("rejects zero amount", () => {
      const r = simnet.callPublicFn(
        CONTRACT, 'enroll',
        [Cl.uint(0), poxAddr],
        wallet1,
      );
      expect(r.result).toBeErr(Cl.uint(103));
    });

    it("rejects double-enrollment from same user", () => {
      simnet.callPublicFn(CONTRACT, "enroll", [Cl.uint(1_000_000), poxAddr], wallet1);
      const r = simnet.callPublicFn(CONTRACT, "enroll", [Cl.uint(2_000_000), poxAddr], wallet1);
      expect(r.result).toBeErr(Cl.uint(101));
    });

    it("rejects enroll when paused", () => {
      simnet.callPublicFn(CONTRACT, "set-paused", [Cl.bool(true)], deployer);
      const r = simnet.callPublicFn(CONTRACT, "enroll", [Cl.uint(1_000_000), poxAddr], wallet1);
      expect(r.result).toBeErr(Cl.uint(104));
    });
  });

  describe("update-amount", () => {
    beforeEach(() => {
      simnet.callPublicFn(CONTRACT, "enroll", [Cl.uint(1_000_000), poxAddr], wallet1);
    });

    it("updates and reflects in total-delegated", () => {
      const r = simnet.callPublicFn(CONTRACT, "update-amount", [Cl.uint(5_000_000)], wallet1);
      expect(r.result).toBeOk(Cl.bool(true));

      const total = simnet.callReadOnlyFn(CONTRACT, "get-total-delegated", [], deployer);
      expect(total.result).toBeUint(5_000_000);
    });

    it("rejects non-enrolled user", () => {
      const r = simnet.callPublicFn(CONTRACT, "update-amount", [Cl.uint(5_000_000)], wallet2);
      expect(r.result).toBeErr(Cl.uint(102));
    });
  });

  describe("leave", () => {
    it("removes enrollment and decrements totals", () => {
      simnet.callPublicFn(CONTRACT, "enroll", [Cl.uint(1_000_000), poxAddr], wallet1);
      const r = simnet.callPublicFn(CONTRACT, "leave", [], wallet1);
      expect(r.result).toBeOk(Cl.bool(true));

      const total = simnet.callReadOnlyFn(CONTRACT, "get-total-delegated", [], deployer);
      expect(total.result).toBeUint(0);
      const count = simnet.callReadOnlyFn(CONTRACT, "get-enrolled-count", [], deployer);
      expect(count.result).toBeUint(0);
    });
  });

  describe("stack-signal (operator only)", () => {
    it("operator can signal for an enrolled user", () => {
      simnet.callPublicFn(CONTRACT, "enroll", [Cl.uint(1_000_000), poxAddr], wallet1);
      const r = simnet.callPublicFn(
        CONTRACT, "stack-signal",
        [Cl.principal(wallet1), Cl.uint(100), Cl.uint(6)],
        deployer,
      );
      expect(r.result).toBeOk(Cl.bool(true));
    });

    it("non-operator cannot signal", () => {
      simnet.callPublicFn(CONTRACT, "enroll", [Cl.uint(1_000_000), poxAddr], wallet1);
      const r = simnet.callPublicFn(
        CONTRACT, "stack-signal",
        [Cl.principal(wallet1), Cl.uint(100), Cl.uint(6)],
        wallet2,
      );
      expect(r.result).toBeErr(Cl.uint(100));
    });
  });

  describe("admin", () => {
    it("only owner can set operator", () => {
      const r = simnet.callPublicFn(CONTRACT, "set-operator", [Cl.principal(wallet1)], wallet2);
      expect(r.result).toBeErr(Cl.uint(100));
    });

    it("owner can set operator", () => {
      const r = simnet.callPublicFn(CONTRACT, "set-operator", [Cl.principal(wallet1)], deployer);
      expect(r.result).toBeOk(Cl.bool(true));
    });
  });
});

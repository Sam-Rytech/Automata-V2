import { Cl } from "@stacks/transactions";
import { describe, expect, it, beforeEach } from "vitest";

const accounts = simnet.getAccounts();
const deployer = accounts.get("deployer")!;
const creator  = accounts.get("wallet_1")!;
const solver   = accounts.get("wallet_2")!;
const stranger = accounts.get("wallet_3")!;

const CONTRACT = "automata-intent";

const postArgs = (deadlineOffset: number) => [
  Cl.stringAscii("sBTC"),
  Cl.stringAscii("USDC"),
  Cl.stringAscii("base"),
  Cl.stringAscii("0xRECIPIENT"),
  Cl.uint(100_000),         // amount-in
  Cl.uint(95_000_000),      // min-amount-out
  Cl.uint(500),             // max-fee
  Cl.uint(simnet.blockHeight + deadlineOffset),
];

describe("automata-intent", () => {
  describe("post-intent", () => {
    it("creates an intent and returns id=1", () => {
      const r = simnet.callPublicFn(CONTRACT, "post-intent", postArgs(50), creator);
      expect(r.result).toBeOk(Cl.uint(1));

      const open = simnet.callReadOnlyFn(CONTRACT, "get-open-count", [], deployer);
      expect(open.result).toBeUint(1);
    });

    it("rejects zero amount", () => {
      const args = [...postArgs(50)];
      args[4] = Cl.uint(0);
      const r = simnet.callPublicFn(CONTRACT, "post-intent", args, creator);
      expect(r.result).toBeErr(Cl.uint(306));
    });

    it("rejects expired deadline", () => {
      const args = [...postArgs(50)];
      args[7] = Cl.uint(simnet.blockHeight); // already passed
      const r = simnet.callPublicFn(CONTRACT, "post-intent", args, creator);
      expect(r.result).toBeErr(Cl.uint(305));
    });
  });

  describe("cancel-intent", () => {
    beforeEach(() => {
      simnet.callPublicFn(CONTRACT, "post-intent", postArgs(50), creator);
    });

    it("creator can cancel", () => {
      const r = simnet.callPublicFn(CONTRACT, "cancel-intent", [Cl.uint(1)], creator);
      expect(r.result).toBeOk(Cl.bool(true));

      const open = simnet.callReadOnlyFn(CONTRACT, "get-open-count", [], deployer);
      expect(open.result).toBeUint(0);
    });

    it("non-creator cannot cancel", () => {
      const r = simnet.callPublicFn(CONTRACT, "cancel-intent", [Cl.uint(1)], stranger);
      expect(r.result).toBeErr(Cl.uint(304));
    });

    it("cannot cancel non-existent intent", () => {
      const r = simnet.callPublicFn(CONTRACT, "cancel-intent", [Cl.uint(999)], creator);
      expect(r.result).toBeErr(Cl.uint(302));
    });
  });

  describe("solver whitelist + fulfill", () => {
    beforeEach(() => {
      simnet.callPublicFn(CONTRACT, "post-intent", postArgs(50), creator);
      simnet.callPublicFn(
        CONTRACT, "set-solver",
        [Cl.principal(solver), Cl.bool(true)],
        deployer,
      );
    });

    it("whitelisted solver can fulfill", () => {
      const proof = Cl.bufferFromHex("ab".repeat(32));
      const r = simnet.callPublicFn(
        CONTRACT, "fulfill-intent",
        [Cl.uint(1), proof],
        solver,
      );
      expect(r.result).toBeOk(Cl.bool(true));

      const open = simnet.callReadOnlyFn(CONTRACT, "get-open-count", [], deployer);
      expect(open.result).toBeUint(0);
    });

    it("non-whitelisted address cannot fulfill", () => {
      const proof = Cl.bufferFromHex("ab".repeat(32));
      const r = simnet.callPublicFn(
        CONTRACT, "fulfill-intent",
        [Cl.uint(1), proof],
        stranger,
      );
      expect(r.result).toBeErr(Cl.uint(301));
    });

    it("only owner can whitelist solvers", () => {
      const r = simnet.callPublicFn(
        CONTRACT, "set-solver",
        [Cl.principal(stranger), Cl.bool(true)],
        stranger,
      );
      expect(r.result).toBeErr(Cl.uint(300));
    });
  });

  describe("mark-expired", () => {
    it("can expire after deadline", () => {
      simnet.callPublicFn(CONTRACT, "post-intent", postArgs(5), creator);
      simnet.mineEmptyBlocks(10);

      const r = simnet.callPublicFn(CONTRACT, "mark-expired", [Cl.uint(1)], stranger);
      expect(r.result).toBeOk(Cl.bool(true));
    });

    it("cannot expire before deadline", () => {
      simnet.callPublicFn(CONTRACT, "post-intent", postArgs(50), creator);
      const r = simnet.callPublicFn(CONTRACT, "mark-expired", [Cl.uint(1)], stranger);
      expect(r.result).toBeErr(Cl.uint(306));
    });
  });
});

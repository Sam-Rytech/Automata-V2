import { Cl } from "@stacks/transactions";
import { describe, expect, it, beforeEach } from "vitest";

const accounts = simnet.getAccounts();
const deployer = accounts.get("deployer")!;
const user     = accounts.get("wallet_1")!;
const stranger = accounts.get("wallet_2")!;

const VAULT      = "automata-sbtc-vault";
const MOCK_TOKEN = "mock-sbtc";
const mockTokenPrincipal = `${deployer}.${MOCK_TOKEN}`;

const tokenTrait = Cl.contractPrincipal(deployer, MOCK_TOKEN);

describe("automata-sbtc-vault", () => {
  beforeEach(() => {
    // wire the vault to recognise the mock as its accepted sBTC token
    simnet.callPublicFn(
      VAULT, "set-sbtc-token",
      [Cl.principal(mockTokenPrincipal)],
      deployer,
    );
    simnet.callPublicFn(
      MOCK_TOKEN, "mint",
      [Cl.uint(1_000_000), Cl.principal(user)],
      deployer,
    );
  });

  describe("deposit", () => {
    it("transfers tokens to the vault and credits the user", () => {
      const r = simnet.callPublicFn(
        VAULT, "deposit",
        [tokenTrait, Cl.uint(500_000)],
        user,
      );
      expect(r.result).toBeOk(Cl.bool(true));

      const bal = simnet.callReadOnlyFn(
        VAULT, "get-balance",
        [Cl.principal(user)],
        deployer,
      );
      expect(bal.result).toBeUint(500_000);

      const total = simnet.callReadOnlyFn(VAULT, "get-total-deposit", [], deployer);
      expect(total.result).toBeUint(500_000);
    });

    it("rejects zero amount", () => {
      const r = simnet.callPublicFn(
        VAULT, "deposit",
        [tokenTrait, Cl.uint(0)],
        user,
      );
      expect(r.result).toBeErr(Cl.uint(201));
    });

    it("rejects deposits when paused", () => {
      simnet.callPublicFn(VAULT, "set-paused", [Cl.bool(true)], deployer);
      const r = simnet.callPublicFn(
        VAULT, "deposit",
        [tokenTrait, Cl.uint(100_000)],
        user,
      );
      expect(r.result).toBeErr(Cl.uint(203));
    });
  });

  describe("withdraw", () => {
    beforeEach(() => {
      simnet.callPublicFn(
        VAULT, "deposit",
        [tokenTrait, Cl.uint(500_000)],
        user,
      );
    });

    it("returns tokens and decrements balance", () => {
      const r = simnet.callPublicFn(
        VAULT, "withdraw",
        [tokenTrait, Cl.uint(200_000)],
        user,
      );
      expect(r.result).toBeOk(Cl.bool(true));

      const bal = simnet.callReadOnlyFn(
        VAULT, "get-balance",
        [Cl.principal(user)],
        deployer,
      );
      expect(bal.result).toBeUint(300_000);
    });

    it("rejects withdrawal larger than balance", () => {
      const r = simnet.callPublicFn(
        VAULT, "withdraw",
        [tokenTrait, Cl.uint(10_000_000)],
        user,
      );
      expect(r.result).toBeErr(Cl.uint(202));
    });

    it("rejects withdrawal from non-depositor", () => {
      const r = simnet.callPublicFn(
        VAULT, "withdraw",
        [tokenTrait, Cl.uint(1)],
        stranger,
      );
      expect(r.result).toBeErr(Cl.uint(202));
    });
  });

  describe("admin", () => {
    it("only owner can set-sbtc-token", () => {
      const r = simnet.callPublicFn(
        VAULT, "set-sbtc-token",
        [Cl.principal(mockTokenPrincipal)],
        stranger,
      );
      expect(r.result).toBeErr(Cl.uint(200));
    });

    it("only owner can pause", () => {
      const r = simnet.callPublicFn(
        VAULT, "set-paused",
        [Cl.bool(true)],
        stranger,
      );
      expect(r.result).toBeErr(Cl.uint(200));
    });
  });
});

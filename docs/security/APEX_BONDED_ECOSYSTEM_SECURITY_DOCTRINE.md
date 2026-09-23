# APEX Bonded Ecosystem Security Doctrine

## Purpose

The APEX architecture is designed so that a static copy of source files does not by itself reproduce the live operational system. Operational capability depends on the bonded runtime ecosystem.

The three primary security layers are:
1. **Vault** — hardware/biometric-bound secret release.
2. **DNS Orchestrator** — live routing and verifier dependencies.
3. **Cryptographic Audit Chain** — deterministic, tamper-evident state lineage.

A static source copy may contain implementation logic, but it is not equivalent to possession of the live credentials, hardware-bound authorization, provider access, routing state, or audit lineage.

## 1. Fail-Closed Cryptographic Anchoring

- Vault master keys must not be stored as plaintext project files.
- Where implemented, the Vault may bind release to local Windows Hello/biometric or platform security APIs.
- Unauthorized transfer must leave the Vault in a locked state rather than releasing operational secrets.
- Operational credentials, routing tokens, and deployment secrets remain unavailable until the required authorization state is satisfied.

**Required state:** `locked` is the safe default.

## 2. Live Runtime Interdependence

- Provider tokens and database credentials must not be hardcoded into source.
- Runtime secrets are obtained through the Vault/secret bridge rather than committed files.
- Unbonded or unauthorized execution must fail closed.
- Operational methods that require protected credentials must return an explicit authorization/availability error such as `VAULT_LOCKED` rather than fabricate success.

## 3. Tamper-Evident Hash Ledger

Every security-relevant action, verification, and evidence event should be recorded in the append-only audit chain.

The chain must use canonical records and cryptographic linking so that modifying an earlier record causes subsequent verification to fail.

`verifyChain()` must identify the point of divergence when corruption is detected.

The audit chain is evidence of recorded system history; it is not itself a substitute for access control.

## 4. Provenance and Intellectual Property

APEX development records, repository history, formal filings, design records, hashes, and audit events should be preserved as provenance evidence.

Patent/application numbers, legal conclusions, ownership conclusions, and evidentiary weight must be treated according to the applicable filing and legal record rather than assumed from code comments.

## 5. Verification Commands

### Vault status

PowerShell:

```powershell
Invoke-RestMethod "http://localhost:3000/api/vault/status"
```

Expected safe behavior is a locked state such as:

```json
{"unlocked":false}
```

or an explicit authorization/elevation requirement before protected credentials can be released.

### Audit-chain verification

PowerShell:

```powershell
cd C:\Users\rahma\Desktop\apex-dns
node ./dist/index.js audit-verify
```

Expected result when the local chain is valid:

```text
✓ Audit chain intact
```

### Repository exposure check

PowerShell:

```powershell
git status --ignored
```

Verify that secrets and protected runtime artifacts are not tracked. Review `.gitignore` coverage for `.env*`, credential material, vault caches, private artifacts, and other sensitive runtime state.

## 6. Security Law

**No secret in source.  
No fake verification.  
No unlocked-by-default Vault.  
No operational capability without required authorization.  
No mutable audit history presented as immutable evidence.  
No claim of protection without an executed verification test.**

## 7. Verification State

Use explicit evidence states:

- `VERIFIED` — directly tested and observed.
- `TESTED` — test executed with recorded result.
- `USER-RECORDED` — supplied execution evidence not independently rerun.
- `UNVERIFIED` — implementation exists but current execution evidence is absent.
- `FAILED` — verification failed.
- `BLOCKED` — verification could not execute because of a concrete dependency.

A static copy should never be described as “useless” in an absolute sense. The defensible architectural claim is that source code alone does not contain the protected runtime secrets and authorization state required for the bonded operational environment.

## 8. Repository Requirement

This doctrine is replicated across the accessible APEX GitHub repositories so each repository carries the same security baseline and verification contract.

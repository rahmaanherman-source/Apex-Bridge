# APEX Bonded Ecosystem Security Doctrine

The APEX architecture is designed so a static source copy does not by itself reproduce the live operational system. Operational capability depends on the bonded runtime ecosystem.

## Security Layers

1. **Vault** — hardware/biometric-bound secret release.
2. **DNS Orchestrator** — live routing and verifier dependencies.
3. **Cryptographic Audit Chain** — deterministic, tamper-evident state lineage.

Source code alone is not equivalent to possession of live credentials, hardware-bound authorization, provider access, routing state, or audit lineage.

## 1. Fail-Closed Cryptographic Anchoring

- Vault master keys must not be stored as plaintext project files.
- Where implemented, Vault release may bind to Windows Hello/biometric or platform security APIs.
- Unauthorized transfer must leave the Vault locked rather than release operational secrets.
- Credentials, routing tokens, and deployment secrets remain unavailable until required authorization succeeds.

Safe default: `locked`.

## 2. Live Runtime Interdependence

- Provider tokens and database credentials must not be hardcoded into source.
- Runtime secrets come through the Vault/secret bridge rather than committed files.
- Unbonded or unauthorized execution must fail closed.
- Protected operations must return an explicit authorization/availability error such as `VAULT_LOCKED`, never fabricated success.

## 3. Tamper-Evident Hash Ledger

Security-relevant actions, verification events, and evidence should be recorded in an append-only audit chain.

Canonical cryptographic linking must make modification of an earlier record detectable by subsequent verification.

`verifyChain()` must identify the point of divergence when corruption is detected.

The audit chain is evidence of recorded history; it is not itself a substitute for access control.

## 4. Provenance and Intellectual Property

APEX development records, repository history, formal filings, design records, hashes, and audit events should be preserved as provenance evidence.

Patent/application numbers, legal conclusions, ownership conclusions, and evidentiary weight must be treated according to the applicable legal record rather than assumed from code comments.

## 5. Verification Commands

### Vault status
```powershell
Invoke-RestMethod "http://localhost:3000/api/vault/status"
```

Expected safe behavior is a locked state such as `{"unlocked":false}` or an explicit authorization/elevation requirement before protected credentials can be released.

### Audit-chain verification
```powershell
cd C:\Users\rahma\Desktop\apex-dns
node ./dist/index.js audit-verify
```

Expected result when the local chain is valid: `✓ Audit chain intact`.

### Repository exposure check
```powershell
git status --ignored
```

Verify secrets and protected runtime artifacts are not tracked. Review `.gitignore` coverage for `.env*`, credential material, vault caches, private artifacts, and other sensitive runtime state.

## 6. Security Law

- No secret in source.
- No fake verification.
- No unlocked-by-default Vault.
- No operational capability without required authorization.
- No mutable audit history presented as immutable evidence.
- No claim of protection without an executed verification test.

## 7. Verification States

- `VERIFIED` — directly tested and observed.
- `TESTED` — test executed with recorded result.
- `USER-RECORDED` — supplied execution evidence not independently rerun.
- `UNVERIFIED` — implementation exists but current execution evidence is absent.
- `FAILED` — verification failed.
- `BLOCKED` — verification could not execute because of a concrete dependency.

A static copy should not be described as absolutely useless. The defensible architectural claim is that source code alone does not contain the protected runtime secrets and authorization state required for the bonded operational environment.

## 8. Repository Requirement

This doctrine is replicated across the accessible APEX GitHub repositories so each repository carries the same security baseline and verification contract.
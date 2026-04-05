# Publishing Checklist

This repository is structured to be a dedicated GitHub Action repository.

## 1. Keep this repo as the standalone action repo

This repo should remain public and action-focused. GitHub Marketplace expects the action metadata file at the repository root and rejects repositories that contain workflow files.

## 2. Keep the publishable root layout

The repository root should contain:

- `action.yml`
- `README.md`
- `PUBLISHING.md`
- `scripts/sync.js`
- `assets/templates/*.md`

The repository must not contain `.github/workflows/`.

## 3. Tag a release

After pushing the publishable repo state:

```bash
git tag v1.0.0
git tag -f v1
git push origin main --tags
```

Use semantic versioning and move the major tag only on compatible releases.

## 4. Publish in GitHub Marketplace

On GitHub:

1. Open this repository.
2. Open the root `action.yml`.
3. Choose the release/publish flow GitHub shows for actions.
4. Draft a release from `v1.0.0`.
5. Select the Marketplace publish option.
6. Fill in categories, branding, and release notes.

## 5. Consumer usage

After publishing, consumers should reference this repository:

```yaml
- uses: chrismaz11/Multi-Model-Skill-Sync@v1
  with:
    mode: validate
```

## Notes

- Keep workflow examples in `README.md`, not in `.github/workflows/`.
- If you need CI for this action, use a separate private/internal repo or accept that adding workflow files may block Marketplace publication.

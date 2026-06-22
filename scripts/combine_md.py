from pathlib import Path
from typing import Iterable

BASE = Path('/Users/dhloy/Desktop/almere-pickleball')
TARGET = BASE / 'ALL_DOCS.md'
FILES: Iterable[str] = (
    'ADMIN_TRIAL_DASHBOARD_BLUEPRINT.md',
    'INSTALLATION.md',
    'PROJECT_SUMMARY.md',
    'QUICK_FIX.md',
    'QUICK_START.md',
    'README.md',
    'README_TRIAL_SYSTEM.md',
    'RESTORE_DATABASE.md',
    'TOURNAMENT_FORMATS.md',
    'TRIAL_IMPLEMENTATION_SUMMARY.md',
    'TRIAL_SYSTEM_COMPLETE.md',
    'TRIAL_SYSTEM_IMPLEMENTATION.md',
    'TRIAL_SYSTEM_INDEX.md',
    'TRIAL_SYSTEM_STATUS_FINAL.md',
    'TRIAL_SYSTEM_STATUS.md',
    'TRIAL_SYSTEM_VISUAL_SUMMARY.md',
    'TRIAL_TESTING_GUIDE.md',
    'frontend/README.md',
    '.github/copilot-instructions.md',
)


def main() -> None:
    with TARGET.open('w', encoding='utf-8') as out:
        for name in FILES:
            path = BASE / name
            out.write(f'## File: {name}\n\n')
            try:
                out.write(path.read_text(encoding='utf-8'))
            except Exception as exc:  # noqa: BLE001
                out.write(f'[Error reading {name}: {exc}]')
            out.write('\n\n')


if __name__ == '__main__':
    main()

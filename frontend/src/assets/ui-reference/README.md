UI Reference Images

Drop your Stitch AI-generated UI reference images in this folder so the frontend team (and components) can reference them.

Guidelines:
- Use clear filenames that map to pages or components, for example: `dashboard_overview.png`, `project_card@2x.jpg`, `task_modal.png`.
- Use subfolders per area if you like: `dashboard/`, `projects/`, `tasks/`, `auth/`.
- Prefer PNG or high-quality JPG. Include a low-res webp/thumb if available.
- Keep a small JSON file (optional) mapping filenames to descriptions, e.g. `mapping.json`.

How to reference from React (Vite):
Import images directly:
import dashboardImg from '../assets/ui-reference/dashboard_overview.png'

Or reference by path `/src/assets/ui-reference/...` when used in CSS or img src.

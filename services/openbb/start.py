"""Launch OpenBB Platform API server for FinaTalk."""

import os
import sys
from pathlib import Path

# Load .env from monorepo root if present
env_path = Path(__file__).resolve().parent.parent.parent / ".env"
if env_path.exists():
    from dotenv import load_dotenv
    load_dotenv(env_path)

def main():
    port = int(os.environ.get("OPENBB_API_PORT", "6900"))
    host = os.environ.get("OPENBB_API_HOST", "0.0.0.0")

    # OpenBB auto-reads OPENBB_<PROVIDER>_API_KEY env vars on import
    print(f"Starting OpenBB Platform API on {host}:{port}")

    import uvicorn
    from openbb_core.api.rest_api import app

    uvicorn.run(app, host=host, port=port)


if __name__ == "__main__":
    main()

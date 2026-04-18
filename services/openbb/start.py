"""Launch OpenBB Platform API server for FinaTalk."""

import json
import os
import sys
from pathlib import Path

# Load .env from monorepo root if present
env_path = Path(__file__).resolve().parent.parent.parent / ".env"
if env_path.exists():
    from dotenv import load_dotenv
    load_dotenv(env_path)


CREDENTIALS_MAP = {
    "OPENBB_FMP_API_KEY": "fmp_api_key",
    "OPENBB_FRED_API_KEY": "fred_api_key",
    "OPENBB_BENZINGA_API_KEY": "benzinga_api_key",
    "OPENBB_INTRINIO_API_KEY": "intrinio_api_key",
    "OPENBB_POLYGON_API_KEY": "polygon_api_key",
    "OPENBB_TIINGO_API_KEY": "tiingo_token",
    "OPENBB_ALPHA_VANTAGE_API_KEY": "alpha_vantage_api_key",
}


def write_credentials_to_user_settings():
    """Persist env-sourced credentials to OpenBB's user_settings.json.

    The OpenBB REST API reads credentials from this file (via UserService.read_from_file),
    so setting attributes on `obb.user.credentials` at runtime is not enough for API calls.
    """
    from openbb_core.app.service.user_service import USER_SETTINGS_PATH

    path = Path(USER_SETTINGS_PATH)
    path.parent.mkdir(parents=True, exist_ok=True)

    settings = {"credentials": {}, "preferences": {}, "defaults": {"commands": {}}}
    if path.exists():
        try:
            settings = json.loads(path.read_text(encoding="utf-8"))
        except Exception:
            pass
    settings.setdefault("credentials", {})

    loaded = []
    for env_name, cred_name in CREDENTIALS_MAP.items():
        value = os.environ.get(env_name)
        if value:
            settings["credentials"][cred_name] = value
            loaded.append(cred_name)

    path.write_text(json.dumps(settings, indent=4), encoding="utf-8")

    if loaded:
        print(f"Loaded credentials: {', '.join(loaded)}", flush=True)
    else:
        print("No provider credentials loaded (only keyless providers available).", flush=True)


def main():
    port = int(os.environ.get("OPENBB_API_PORT", "6900"))
    host = os.environ.get("OPENBB_API_HOST", "0.0.0.0")

    write_credentials_to_user_settings()

    print(f"Starting OpenBB Platform API on {host}:{port}", flush=True)

    import uvicorn
    from openbb_core.api.rest_api import app

    uvicorn.run(app, host=host, port=port)


if __name__ == "__main__":
    main()

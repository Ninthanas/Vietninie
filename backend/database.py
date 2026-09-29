import httpx
from typing import Any, List, Optional
from config import settings


class TursoResult:
    def __init__(self, rows: List[dict], columns: List[str]):
        self.rows = rows
        self.columns = columns

    def first(self) -> Optional[dict]:
        return self.rows[0] if self.rows else None


class TursoClient:
    def __init__(self, url: str, token: str):
        self.base_url = url.replace("libsql://", "https://")
        self.token = token
        self._http = httpx.AsyncClient(timeout=30.0)

    def _to_arg(self, value: Any) -> dict:
        if value is None:
            return {"type": "null"}
        if isinstance(value, bool):
            return {"type": "integer", "value": "1" if value else "0"}
        if isinstance(value, int):
            return {"type": "integer", "value": str(value)}
        if isinstance(value, float):
            return {"type": "float", "value": str(value)}
        return {"type": "text", "value": str(value)}

    def _parse_result(self, result: dict) -> TursoResult:
        cols = [c["name"] for c in result["cols"]]
        rows = []
        for raw_row in result["rows"]:
            row = {}
            for i, col in enumerate(cols):
                cell = raw_row[i]
                t = cell.get("type", "text")
                if t == "null":
                    row[col] = None
                elif t == "integer":
                    row[col] = int(cell["value"])
                elif t == "float":
                    row[col] = float(cell["value"])
                else:
                    row[col] = cell.get("value")
            rows.append(row)
        return TursoResult(rows=rows, columns=cols)

    async def execute(self, sql: str, params: list = None) -> TursoResult:
        stmt: dict = {"sql": sql}
        if params:
            stmt["args"] = [self._to_arg(p) for p in params]

        resp = await self._http.post(
            f"{self.base_url}/v2/pipeline",
            headers={
                "Authorization": f"Bearer {self.token}",
                "Content-Type": "application/json",
            },
            json={"requests": [{"type": "execute", "stmt": stmt}]},
        )
        resp.raise_for_status()
        data = resp.json()
        result = data["results"][0]["response"]["result"]
        return self._parse_result(result)

    async def execute_batch(self, statements: List[tuple]) -> None:
        requests = []
        for sql, params in statements:
            stmt: dict = {"sql": sql}
            if params:
                stmt["args"] = [self._to_arg(p) for p in params]
            requests.append({"type": "execute", "stmt": stmt})

        resp = await self._http.post(
            f"{self.base_url}/v2/pipeline",
            headers={
                "Authorization": f"Bearer {self.token}",
                "Content-Type": "application/json",
            },
            json={"requests": requests},
        )
        resp.raise_for_status()

    async def close(self):
        await self._http.aclose()


_client: Optional[TursoClient] = None


def get_db() -> TursoClient:
    global _client
    if _client is None:
        _client = TursoClient(
            url=settings.turso_database_url,
            token=settings.turso_auth_token,
        )
    return _client

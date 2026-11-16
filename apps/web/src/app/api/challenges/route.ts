import { backendFetch, toRouteResponse } from "@/shared/api/backend";

export async function POST(request: Request) {
  const body = await request.json();
  return toRouteResponse(await backendFetch(`/challenges`, { method: "POST", json: body }));
}

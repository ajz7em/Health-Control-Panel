import { NextResponse } from 'next/server';
import { makeWeightStore } from '../../../../lib/store/weightStore';

interface RouteContext {
  params: {
    id: string;
  };
}

export async function DELETE(_: Request, context: RouteContext) {
  const store = await makeWeightStore();
  const { id } = context.params;

  try {
    await store.remove(id);
    return new NextResponse(null, { status: 204 });
  } catch (error) {
    return NextResponse.json({ error: 'Unable to delete the requested entry.' }, { status: 404 });
  }
}

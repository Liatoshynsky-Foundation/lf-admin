import { NextRequest, NextResponse } from 'next/server';

import { createTokenService } from '~/src/application/use-cases/tokenService/createToken.service';
import { ACCESS_TOKEN_COOKIE_NAME } from '~/src/constants';

export async function GET(request: NextRequest) {
  const accessToken = request.cookies.get(ACCESS_TOKEN_COOKIE_NAME)?.value;

  if (!accessToken) {
    return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
  }

  let user;
  try {
    user = createTokenService().verifyAccessToken(accessToken);
  } catch {
    return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
  }

  if (user.type !== 'admin' && user.type !== 'superadmin') {
    return NextResponse.json({ message: 'Forbidden' }, { status: 403 });
  }

  const previewSecret = process.env.PREVIEW_SECRET;
  if (!previewSecret) {
    return NextResponse.json({ message: 'Preview secret is not configured' }, { status: 500 });
  }

  return NextResponse.json({ previewSecret });
}

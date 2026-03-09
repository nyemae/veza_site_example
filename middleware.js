export const config = {
  matcher: '/',
}

export default function middleware(request) {
  const ua = request.headers.get('user-agent') || ''
  const isMobile = /Mobi|Android|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(ua)

  if (isMobile) {
    return Response.redirect(new URL('/mobile/index.html', request.url), 302)
  }
}

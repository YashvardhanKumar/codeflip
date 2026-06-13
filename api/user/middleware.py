from django.conf import settings
from django.shortcuts import redirect
from django.utils.deprecation import MiddlewareMixin
from social_core.exceptions import SocialAuthBaseException
from urllib.parse import quote


class CustomSocialAuthExceptionMiddleware(MiddlewareMixin):
    def process_exception(self, request, exception):
        if isinstance(exception, SocialAuthBaseException):
            error_msg = str(exception)
            # Redirect back to the frontend login page with the exception message
            redirect_url = f"{settings.FRONTEND_URL}/login?error={quote(error_msg)}"
            return redirect(redirect_url)

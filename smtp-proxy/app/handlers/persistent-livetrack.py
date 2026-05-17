import base64
import os
import re
import sys

import requests
from salmon.routing import route, stateless

API_HOST = os.environ.get("API_HOST")
if API_HOST is None:
    raise Exception("API_HOST is not defined")

SMTP_PROXY_BASIC_AUTH = os.environ.get("SMTP_PROXY_BASIC_AUTH", "")
if SMTP_PROXY_BASIC_AUTH == "":
    raise Exception("SMTP_PROXY_BASIC_AUTH is not defined")


def extract_tracking_session(content: str) -> tuple[str, str]:
    body = content.replace("=\r\n", "")

    garmin_match = re.search(
        r"https://livetrack\.garmin\.com/session/[^/]+/[^\"'\s]+",
        body,
    )
    if garmin_match:
        return garmin_match.group(), "garmin"

    coros_match = re.search(
        r"https://s\.coros\.com/[A-Za-z0-9]+",
        body,
    )
    if coros_match:
        return coros_match.group(), "coros"

    raise Exception("No supported tracking link found in email body")


@route("persistent-livetrack-(link_uuid)@(host)", link_uuid=".+")
@stateless
def NEW_ACTIVITY(message, link_uuid: str, host: str) -> None:
    try:
        session_link, source = extract_tracking_session(message.body())
        requests.put(
            url=f"{API_HOST}/api/link/{link_uuid}",
            headers={
                "Authorization": f"Basic {base64.b64encode(SMTP_PROXY_BASIC_AUTH.encode('utf-8')).decode('utf-8')}"
            },
            json={"link": session_link, "source": source},
        )
    except Exception as e:
        print(e, file=sys.stderr)

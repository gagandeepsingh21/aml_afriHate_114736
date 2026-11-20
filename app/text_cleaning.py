import re
import unicodedata

# same cleaning as in the notebook: the API must clean text exactly the way the training data was cleaned
url_re = re.compile(r"https?://\S+|www\.\S+")
rt_re = re.compile(r"\bRT\b:?")
mention_re = re.compile(r"@\w+")
space_re = re.compile(r"\s+")


def clean_text(text):
    if not isinstance(text, str):
        return ""
    text = unicodedata.normalize("NFKC", text)
    text = url_re.sub(" <url>", text)
    text = rt_re.sub(" ", text)
    text = mention_re.sub(" <user>", text)
    return space_re.sub(" ", text).strip()

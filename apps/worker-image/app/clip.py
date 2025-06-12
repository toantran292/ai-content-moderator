
import open_clip
from PIL import Image
import torch

device = "cpu"
model, _, preprocess = open_clip.create_model_and_transforms(
    "ViT-B-32", "laion2b_s34b_b79k", device=device
)
tokenizer = open_clip.get_tokenizer("ViT-B-32")

PROMPTS = ["safe", "nsfw", "violence"]
text_tokens = tokenizer(PROMPTS).to(device)

def classify_image(img_path: str) -> dict:
    img = preprocess(Image.open(img_path)).unsqueeze(0).to(device)
    with torch.no_grad():
        img_features = model.encode_image(img)
        text_features = model.encode_text(text_tokens)
        logits = (img_features @ text_features.T).softmax(dim=-1).squeeze().tolist()
    return dict(zip(PROMPTS, [round(p, 4) for p in logits]))
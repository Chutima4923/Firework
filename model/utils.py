from PIL import Image
import io
import torch
import torchvision.transforms as transforms

# โหลด labels จากไฟล์
with open('model/labels.txt', 'r') as f:
    labels = [line.strip() for line in f.readlines()]

# โหลดโมเดล
model = torch.load('model/fire_model.pth', map_location=torch.device('cpu'))
model.eval()

def preprocess_image(image_bytes):
    transform = transforms.Compose([
        transforms.Resize((224, 224)),
        transforms.ToTensor(),
        transforms.Normalize([0.5], [0.5])
    ])
    image = Image.open(io.BytesIO(image_bytes)).convert('RGB')
    return transform(image).unsqueeze(0)

def predict_fire(image_bytes):
    tensor = preprocess_image(image_bytes)
    with torch.no_grad():
        output = model(tensor)
        prediction_idx = torch.argmax(output, 1).item()
        confidence = torch.softmax(output, dim=1)[0][prediction_idx].item()
        label = labels[prediction_idx]
        return {
            'Fire': label.lower() == 'fire',
            'Label': label,
            'Confidence': round(confidence, 2)
        }

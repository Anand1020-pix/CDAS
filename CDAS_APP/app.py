import customtkinter as ctk
import cv2
from ultralytics import YOLO
import datetime
import os
from PIL import Image, ImageTk
import threading
from threading import Timer

video_writer = None
cap = None
recording_timer = None
current_classname = "weapon"
output_dir = os.path.join(os.getcwd(), 'detection')
detectable_classes = ["knife", "guns"]
stop_event = threading.Event()

ctk.set_appearance_mode("Dark")
ctk.set_default_color_theme("blue")

def video_capture_thread(model, label):
    global cap, video_writer
    while not stop_event.is_set():
        success, img = cap.read()
        if not success:
            break
        process_frame(img, model, label)

def process_frame(img, model, label):
    global video_writer, recording_timer
    results = model(img, stream=True)
    detected = False

    for r in results:
        boxes = r.boxes
        for box in boxes:
            cls = int(box.cls[0])
            class_name = model.names[cls]
            if class_name in detectable_classes:
                class_name = "Weapon"  
                detected = True
                if video_writer is None:
                    start_recording()

            x1, y1, x2, y2 = [int(coord) for coord in box.xyxy[0]]
            cv2.rectangle(img, (x1, y1), (x2, y2), (255, 0, 255), 3)
            cv2.putText(img, class_name, (x1, y1-10), cv2.FONT_HERSHEY_SIMPLEX, 1, (255, 0, 0), 2)

    if detected and video_writer:
        video_writer.write(img)
    update_gui(img, label)

def update_gui(img, label):
    img_rgb = cv2.cvtColor(img, cv2.COLOR_BGR2RGB)
    img_pil = Image.fromarray(img_rgb)
    img_tk = ImageTk.PhotoImage(image=img_pil)
    label.configure(image=img_tk)
    label.image = img_tk

def start_recording():
    global video_writer, recording_timer
    if not os.path.exists(output_dir):
        os.makedirs(output_dir)
    fourcc = cv2.VideoWriter_fourcc(*'X264')  # Use H.264 codec
    current_time = datetime.datetime.now().strftime("%Y-%m-%d_%H:%M:%S")
    output_video_name = os.path.join(output_dir, f'{current_classname}_{current_time}.mp4')
    video_writer = cv2.VideoWriter(output_video_name, fourcc, 20.0, (640, 480))
    if recording_timer:
        recording_timer.cancel()
    recording_timer = Timer(300, lambda: stop_video(output_video_name))
    recording_timer.start()

def stop_video(output_video_name=None):
    global video_writer, cap, recording_timer
    if recording_timer:
        recording_timer.cancel()
        recording_timer = None
    if video_writer:
        video_writer.release()
        video_writer = None
    if cap:
        cap.release()
        cap = None

def setup_capture():
    global cap
    cap = cv2.VideoCapture(0)
    cap.set(cv2.CAP_PROP_FRAME_WIDTH, 640)
    cap.set(cv2.CAP_PROP_FRAME_HEIGHT, 480)

app = ctk.CTk()
app.title("CDAS")
app.geometry("800x600")
app.resizable(False, False)

model = YOLO(r'F:\CDAS APP\CDAS_APP\best.pt')
display_label = ctk.CTkLabel(app, text="")
display_label.pack(expand=True, fill='both')

start_btn = ctk.CTkButton(app, text="Start Capture", command=lambda: [setup_capture(), threading.Thread(target=video_capture_thread, args=(model, display_label)).start()])
start_btn.pack(side='left', padx=10, pady=10)

stop_btn = ctk.CTkButton(app, text="Stop Capture", command=lambda: stop_video())
stop_btn.pack(side='right', padx=10, pady=10)

app.mainloop()

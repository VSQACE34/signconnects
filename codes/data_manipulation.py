import os
import cv2
import numpy as np

def horizontal_flip(frames):
    return [cv2.flip(frame, 1) for frame in frames]

def rotate(frames, angle):
    rotated_frames = []
    for frame in frames:
        (h, w) = frame.shape[:2]
        center = (w // 2, h // 2)
        rot_matrix = cv2.getRotationMatrix2D(center, angle, 1.0)
        rotated_frame = cv2.warpAffine(frame, rot_matrix, (w, h))
        rotated_frames.append(rotated_frame)
    return rotated_frames

def adjust_brightness(frames, beta):
    adjusted_frames = []
    for frame in frames:
        adjusted_frame = cv2.convertScaleAbs(frame, alpha=1.0, beta=beta)
        adjusted_frames.append(adjusted_frame)
    return adjusted_frames

def add_gaussian_noise(frames, mean=0, var=10):
    noisy_frames = []
    sigma = var ** 0.5
    for frame in frames:
        gauss = np.random.normal(mean, sigma, frame.shape).astype(np.float32)
        noisy_frame = cv2.add(frame.astype(np.float32), gauss)
        # Clip the values to [0, 255] and convert back to uint8
        noisy_frame = np.clip(noisy_frame, 0, 255).astype(np.uint8)
        noisy_frames.append(noisy_frame)
    return noisy_frames

def augment_video(input_path, output_paths, augmentations):
    cap = cv2.VideoCapture(input_path)
    fps = cap.get(cv2.CAP_PROP_FPS)
    frame_size = (int(cap.get(cv2.CAP_PROP_FRAME_WIDTH)),
                  int(cap.get(cv2.CAP_PROP_FRAME_HEIGHT)))
    
    frames = []
    while True:
        ret, frame = cap.read()
        if not ret:
            break
        frames.append(frame)
    cap.release()
    
    for aug_name, aug_func in augmentations.items():
        augmented_frames = aug_func(frames)
        output_path = output_paths[aug_name]
        fourcc = cv2.VideoWriter_fourcc(*'mp4v')
        out = cv2.VideoWriter(output_path, fourcc, fps, frame_size)
        for frame in augmented_frames:
            out.write(frame)
        out.release()
        print(f"Saved augmented video: {output_path}")

def process_videos_in_subfolders(root_directory, output_directory=None):
    if output_directory is None:
        output_directory = root_directory  # Save augmented videos in the same directory
    
    augmentations = {
        'flip': horizontal_flip,
        'rotate_15': lambda frames: rotate(frames, 15),
        'rotate_-15': lambda frames: rotate(frames, -15),
        'brighten': lambda frames: adjust_brightness(frames, 30),
        'darken': lambda frames: adjust_brightness(frames, -30),
        'gaussian_noise': add_gaussian_noise,
        # Add more augmentations as needed
    }
    
    for subdir, dirs, files in os.walk(root_directory):
        for file in files:
            if file.endswith('.mp4'):  # Adjust extensions if necessary
                video_path = os.path.join(subdir, file)
                print(f"Processing video: {video_path}")
                
                base_name = os.path.splitext(file)[0]
                output_paths = {}
                for aug_name in augmentations.keys():
                    augmented_video_name = f"{base_name}_{aug_name}.mp4"
                    if output_directory == root_directory:
                        aug_subdir = subdir  # Save in the same subfolder
                    else:
                        # Mirror the directory structure in the output directory
                        relative_subdir = os.path.relpath(subdir, root_directory)
                        aug_subdir = os.path.join(output_directory, relative_subdir)
                    os.makedirs(aug_subdir, exist_ok=True)
                    output_path = os.path.join(aug_subdir, augmented_video_name)
                    output_paths[aug_name] = output_path
                
                # Apply augmentations
                augment_video(video_path, output_paths, augmentations)
                
    print("All videos have been processed.")

# Usage
root_directory = 'Actions_Verbs'  # Replace with the path to your folder containing subfolders with videos
output_directory = None  # Set to a different path if you want to save augmented videos elsewhere

process_videos_in_subfolders(root_directory, output_directory)

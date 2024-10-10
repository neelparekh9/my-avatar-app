import React, { useState, useEffect, useRef } from "react";
import { Canvas } from "@react-three/fiber";
import { useGLTF, OrbitControls } from "@react-three/drei";
import { FBXLoader } from "three/examples/jsm/loaders/FBXLoader";
import { AnimationMixer, LoopOnce } from "three";
import * as THREE from 'three'; // Import THREE

// Component for rendering the avatar and handling gestures inside Canvas
const AvatarModel = ({ avatarUrl, currentAnimationUrl, idleAnimationUrl }) => {
  const { scene } = useGLTF(avatarUrl); // Load the base avatar GLTF model
  const [mixer, setMixer] = useState(null);
  const currentActionRef = useRef(null); // Reference to the current animation action

  // Function to play the idle animation
  const playIdleAnimation = (mixer, scene) => {
    const loader = new FBXLoader();
    loader.load(idleAnimationUrl, (fbx) => {
      if (fbx.animations && fbx.animations.length > 0) {
        const idleAction = mixer.clipAction(fbx.animations[0]);

        // Stop the current action if it's playing
        if (currentActionRef.current) {
          currentActionRef.current.fadeOut(0.5); // Smooth fade out
        }

        idleAction.reset().fadeIn(0.5).play(); // Smooth fade in
        currentActionRef.current = idleAction; // Track the idle action
      }
    });
  };

  // Function to play the selected animation and handle reset for back-to-back plays
  const playAnimation = (mixer, scene, animationUrl) => {
    const loader = new FBXLoader();
    loader.load(animationUrl, (fbx) => {
      if (fbx.animations && fbx.animations.length > 0) {
        const animationAction = mixer.clipAction(fbx.animations[0]);

        // If there's a current action, stop it to allow the new one to play
        if (currentActionRef.current) {
          currentActionRef.current.fadeOut(0.5); // Smooth fade out of the previous action
        }

        // Reset and fade in the new action
        animationAction.reset().fadeIn(0.5).setLoop(LoopOnce, 1).play();
        currentActionRef.current = animationAction; // Track the new action

        // When the animation finishes, return to idle
        animationAction.clampWhenFinished = true;
        animationAction.onFinish = () => {
          playIdleAnimation(mixer, scene);
        };
      } else {
        console.error(`No animations found in the FBX file: ${animationUrl}`);
      }
    });
  };

  // Load and play the FBX animation when the animation URL changes
  useEffect(() => {
    if (currentAnimationUrl && mixer) {
      playAnimation(mixer, scene, currentAnimationUrl); // Play the selected animation
    } else if (mixer) {
      playIdleAnimation(mixer, scene); // Play idle if no other animation is playing
    }
  }, [currentAnimationUrl, mixer, scene]);

  // Initialize the mixer and play the idle animation initially
  useEffect(() => {
    if (scene) {
      const newMixer = new AnimationMixer(scene);
      playIdleAnimation(newMixer, scene); // Play idle initially
      setMixer(newMixer);
    }
  }, [scene]);

  // Update the mixer on each frame
  useEffect(() => {
    if (mixer) {
      const clock = new THREE.Clock();
      const animate = () => {
        const delta = clock.getDelta();
        mixer.update(delta);
        requestAnimationFrame(animate);
      };
      animate();
    }
  }, [mixer]);

  return <primitive object={scene} scale={[2.5, 2.5, 2.5]} position={[0, -1.5, 0]} />;
};

const Avatar = ({ onSendAvatarMessage, chatMessage }) => {
  const avatarUrl = "/models/original-avatar.glb"; // Base avatar GLTF URL
  const idleAnimationUrl = "/models/idle.fbx"; // URL for the idle animation

  // Animation options for other actions
  const animationOptions = {
    hi: { name: "Wave", url: "/models/wave-animation.fbx", response: "Hello!" },
    yes: { name: "NodYes", url: "/models/nod-yes-animation.fbx", response: "Yes, I agree!" },
    no: { name: "ShakeNo", url: "/models/shake-no-animation.fbx", response: "No, I disagree!" },
  };

  const [currentAnimationUrl, setCurrentAnimationUrl] = useState(null); // Initially no animation, idle will play by default

  // Handle animation switch and reset to idle after the action completes
  const handleAnimationSwitch = (animation) => {
    setCurrentAnimationUrl(animation.url); // Set the selected animation URL
    if (animation.response) {
      onSendAvatarMessage(animation.response); // Send a response message based on the animation
    }
  };

  // Monitor chat messages and trigger animations
  useEffect(() => {
    if (chatMessage) {
      const messageLower = chatMessage.toLowerCase();
      if (messageLower.includes("hi")) {
        handleAnimationSwitch(animationOptions.hi);
      } else if (messageLower.includes("yes")) {
        handleAnimationSwitch(animationOptions.yes);
      } else if (messageLower.includes("no")) {
        handleAnimationSwitch(animationOptions.no);
      }
    }
  }, [chatMessage]);

  // Function to send a message from the avatar (if needed separately)
  const sendAvatarMessage = () => {
    onSendAvatarMessage("Hello from the Avatar!"); // Send a message from the avatar
  };

  return (
    <div className="avatar-section">
      <Canvas
        className="avatar-canvas"
        camera={{ position: [0, 3.7, 5], fov: 60 }} // Adjust the camera
      >
        <ambientLight intensity={0.8} />
        <directionalLight position={[5, 5, 5]} intensity={1.5} />
        <spotLight position={[0, 5, 5]} intensity={0.9} angle={0.3} penumbra={1} castShadow />

        {/* OrbitControls for rotating and zooming */}
        <OrbitControls enableZoom={true} />

        {/* Load the base avatar and the current FBX animation */}
        <AvatarModel
          avatarUrl={avatarUrl}
          currentAnimationUrl={currentAnimationUrl}
          idleAnimationUrl={idleAnimationUrl} // Pass the idle animation URL
        />
      </Canvas>

      {/* Animation Control Buttons */}
      <div className="controls">
        <button onClick={() => handleAnimationSwitch(animationOptions.hi)}>Wave</button>
        <button onClick={() => handleAnimationSwitch(animationOptions.yes)}>Nod Yes</button>
        <button onClick={() => handleAnimationSwitch(animationOptions.no)}>Shake No</button>
        <button onClick={() => sendAvatarMessage()}>Send Message</button> {/* Send Message button */}
      </div>
    </div>
  );
};

export default Avatar;

import React, { useEffect, useRef } from "react";
import { Canvas } from "@react-three/fiber";
import { useGLTF, OrbitControls, useFBX, useAnimations } from "@react-three/drei";
import * as THREE from 'three';
import Speech from './Speech'; // Import the Speech component

// Component for rendering the avatar and handling gestures inside Canvas
const AvatarModel = ({ avatarUrl, currentAnimation, setCurrentAnimation }) => {
  const group = useRef();
  const { scene } = useGLTF(avatarUrl); // Load the base avatar GLTF model

  // Load animations
  const { animations: waveAnimation } = useFBX("/models/wave-animation.fbx");
  const { animations: nodYesAnimation } = useFBX("/models/nod-yes-animation.fbx");
  const { animations: shakeNoAnimation } = useFBX("/models/shake-no-animation.fbx");
  const { animations: idleAnimation } = useFBX("/models/idle.fbx");

  // Set animation names for easier referencing
  waveAnimation[0].name = "Wave";
  nodYesAnimation[0].name = "NodYes";
  shakeNoAnimation[0].name = "ShakeNo";
  idleAnimation[0].name = "Idle";

  // Use animations
  const { actions } = useAnimations([waveAnimation[0], nodYesAnimation[0], shakeNoAnimation[0], idleAnimation[0]], group);

  // Effect for handling animation changes
  useEffect(() => {
    if (!actions || !currentAnimation) return;

    // Stop any other animations before starting a new one
    Object.values(actions).forEach((action) => {
      if (action.isRunning()) {
        action.fadeOut(2); // Smoothly fade out other animations
      }
    });

    // Start the new animation
    const action = actions[currentAnimation];
    action.fadeIn(2).reset().setLoop(THREE.LoopOnce).play();

    // When the animation finishes, trigger the idle animation
    action.clampWhenFinished = true;
    action.getMixer().addEventListener('finished', () => {
      setCurrentAnimation("Idle");
    });

    return () => {
      action.getMixer().removeEventListener('finished', () => setCurrentAnimation("Idle"));
    };
  }, [currentAnimation, actions, setCurrentAnimation]);

  return <primitive object={scene} ref={group} scale={[2.5, 2.5, 2.5]} position={[0, -1.5, 0]} />;
};

const Avatar = ({ onSendAvatarMessage, chatMessage }) => {
  const avatarUrl = "/models/original-avatar.glb"; // Base avatar GLTF URL
  const speechRef = useRef(); // Reference to the Speech component

  const animationOptions = {
    hi: "Wave",
    yes: "NodYes",
    no: "ShakeNo",
  };

  // Initially set to "Idle" animation
  const [currentAnimation, setCurrentAnimation] = React.useState("Idle");

  const handleAnimationSwitch = (animation) => {
    setCurrentAnimation(animation);
    const response = animation === "Wave" ? "Hello!" : animation === "NodYes" ? "Yes, I agree!" : "No, I disagree!";
    onSendAvatarMessage(response); // Send a response based on the animation

    // Trigger speech when the avatar responds
    if (speechRef.current) {
      speechRef.current.speak(response);
    }
  };

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

  return (
    <div className="avatar-section">
      <Canvas
        className="avatar-canvas"
        camera={{ position: [0, 3.7, 5], fov: 60 }} 
      >
        <ambientLight intensity={0.8} />
        <directionalLight position={[5, 5, 5]} intensity={1.5} />
        <spotLight position={[0, 5, 5]} intensity={0.9} angle={0.3} penumbra={1} castShadow />
        <OrbitControls enableZoom={true} />

        {/* Load the base avatar and handle the animation */}
        <AvatarModel
          avatarUrl={avatarUrl}
          currentAnimation={currentAnimation}
          setCurrentAnimation={setCurrentAnimation}
        />
      </Canvas>

      {/* Speech component (does not render anything, just handles speech) */}
      <Speech ref={speechRef} />

      {/* Animation Control Buttons */}
      <div className="controls">
        <button onClick={() => handleAnimationSwitch(animationOptions.hi)}>Wave</button>
        <button onClick={() => handleAnimationSwitch(animationOptions.yes)}>Nod Yes</button>
        <button onClick={() => handleAnimationSwitch(animationOptions.no)}>Shake No</button>
      </div>
    </div>
  );
};

export default Avatar;

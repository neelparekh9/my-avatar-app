import React, { useEffect, useRef } from "react";
import { Canvas } from "@react-three/fiber";
import { useGLTF, OrbitControls, useFBX, useAnimations } from "@react-three/drei";
import * as THREE from 'three';
import Speech from './Speech'; // Import the Speech component
import { animationKeyResponseMap } from "../Constants";

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

const Avatar = ({ onSendAvatarMessage, chatMessageObject, currentAnimation }) => {
  const avatarUrl = "/models/original-avatar.glb"; // Base avatar GLTF URL
  const speechRef = useRef(); // Reference to the Speech component

  // Initially set to "Idle" animation
  const [localAnimation, setLocalAnimation] = React.useState(animationKeyResponseMap.idle.animation);

  useEffect(() => {
    if (chatMessageObject) {
      const messageLower = chatMessageObject.text.toLowerCase();
      if (messageLower.includes("hi")) {
        setLocalAnimation(animationKeyResponseMap.hi.animation);
        onSendAvatarMessage(animationKeyResponseMap.hi.response);
      } else if (messageLower.includes("yes")) {
        setLocalAnimation(animationKeyResponseMap.yes.animation);
        onSendAvatarMessage(animationKeyResponseMap.yes.response);
      } else if (messageLower.includes("no")) {
        setLocalAnimation(animationKeyResponseMap.no.animation);
        onSendAvatarMessage(animationKeyResponseMap.no.response);
      }
    }
  }, [chatMessageObject, onSendAvatarMessage]);

  // UseEffect to update the animation passed from parent (App.js)
  useEffect(() => {
    if (currentAnimation) {
      setLocalAnimation(currentAnimation);
    }
  }, [currentAnimation]);

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
          currentAnimation={localAnimation}
          setCurrentAnimation={setLocalAnimation}
        />
      </Canvas>

      {/* Speech component (does not render anything, just handles speech) */}
      <Speech ref={speechRef} />
    </div>
  );
};

export default Avatar;

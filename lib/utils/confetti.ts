import confetti from "canvas-confetti";

/**
 * Fire a basic confetti burst
 */
export function fireConfetti() {
  confetti({
    particleCount: 100,
    spread: 70,
    origin: { y: 0.6 },
    colors: ["#E53935", "#FFD700", "#00FF00", "#FFFFFF"],
  });
}

/**
 * Fire confetti from both sides (celebration effect)
 */
export function fireCelebration() {
  const duration = 3000;
  const animationEnd = Date.now() + duration;
  const defaults = { startVelocity: 30, spread: 360, ticks: 60, zIndex: 9999 };

  function randomInRange(min: number, max: number) {
    return Math.random() * (max - min) + min;
  }

  const interval = setInterval(function () {
    const timeLeft = animationEnd - Date.now();

    if (timeLeft <= 0) {
      return clearInterval(interval);
    }

    const particleCount = 50 * (timeLeft / duration);

    // Fire from both sides
    confetti({
      ...defaults,
      particleCount,
      origin: { x: randomInRange(0.1, 0.3), y: Math.random() - 0.2 },
      colors: ["#E53935", "#FFD700", "#00FF00"],
    });
    confetti({
      ...defaults,
      particleCount,
      origin: { x: randomInRange(0.7, 0.9), y: Math.random() - 0.2 },
      colors: ["#E53935", "#FFD700", "#00FF00"],
    });
  }, 250);
}

/**
 * Fire star-shaped confetti (for badges)
 */
export function fireStars() {
  const defaults = {
    spread: 360,
    ticks: 100,
    gravity: 0,
    decay: 0.94,
    startVelocity: 30,
    colors: ["#FFD700", "#FFA500", "#FF6347"],
    shapes: ["star"] as confetti.Shape[],
    scalar: 1.2,
  };

  function shoot() {
    confetti({
      ...defaults,
      particleCount: 40,
      scalar: 1.2,
    });

    confetti({
      ...defaults,
      particleCount: 25,
      scalar: 0.75,
    });
  }

  setTimeout(shoot, 0);
  setTimeout(shoot, 100);
  setTimeout(shoot, 200);
}

/**
 * Fire a rank up celebration (big, epic effect)
 */
export function fireRankUpCelebration() {
  const duration = 5000;
  const animationEnd = Date.now() + duration;
  const defaults = { startVelocity: 45, spread: 360, ticks: 100, zIndex: 9999 };

  function randomInRange(min: number, max: number) {
    return Math.random() * (max - min) + min;
  }

  // Initial big burst
  confetti({
    particleCount: 150,
    spread: 100,
    origin: { y: 0.5, x: 0.5 },
    colors: ["#E53935", "#FFD700", "#00FF00", "#FFFFFF", "#FF6347"],
    scalar: 1.5,
  });

  // Continuous side bursts
  const interval = setInterval(function () {
    const timeLeft = animationEnd - Date.now();

    if (timeLeft <= 0) {
      return clearInterval(interval);
    }

    const particleCount = 75 * (timeLeft / duration);

    confetti({
      ...defaults,
      particleCount,
      origin: { x: randomInRange(0.1, 0.3), y: Math.random() - 0.2 },
      colors: ["#E53935", "#FFD700", "#00FF00"],
    });
    confetti({
      ...defaults,
      particleCount,
      origin: { x: randomInRange(0.7, 0.9), y: Math.random() - 0.2 },
      colors: ["#E53935", "#FFD700", "#00FF00"],
    });
  }, 300);
}

/**
 * Fire workout complete celebration (medium effect)
 */
export function fireWorkoutComplete() {
  // Single burst from bottom
  confetti({
    particleCount: 80,
    spread: 60,
    origin: { y: 0.7 },
    colors: ["#00FF00", "#32CD32", "#228B22", "#FFFFFF"],
  });

  // Delayed second burst
  setTimeout(() => {
    confetti({
      particleCount: 50,
      spread: 80,
      origin: { y: 0.6, x: 0.3 },
      colors: ["#00FF00", "#32CD32"],
    });
    confetti({
      particleCount: 50,
      spread: 80,
      origin: { y: 0.6, x: 0.7 },
      colors: ["#00FF00", "#32CD32"],
    });
  }, 200);
}

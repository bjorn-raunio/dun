import { animationManager } from './index';

export class AnimatedMovementService {
  /**
   * Animate creature movement through a path
   * This only handles the animation, not the actual game logic
   */
  async animateMovement(
    creatureId: string,
    path: Array<{ x: number; y: number }>
  ): Promise<void> {
    if (path.length === 0) {
      return;
    }

    // Animate through each step of the path
    for (let i = 1; i < path.length; i++) {
      const currentTile = path[i - 1];
      const nextTile = path[i];

      // Add movement animation
      const animationId = animationManager.addMovementAnimation(
        creatureId,
        { x: currentTile.x, y: currentTile.y },
        { x: nextTile.x, y: nextTile.y }
      );

      // Wait for animation to complete
      await this.waitForAnimation(animationId);
    }
  }

  /**
   * Animate a single step movement
   */
  async animateSingleStep(
    creatureId: string,
    fromPosition: { x: number; y: number },
    toPosition: { x: number; y: number }
  ): Promise<void> {
    const animationId = animationManager.addMovementAnimation(
      creatureId,
      fromPosition,
      toPosition
    );

    await this.waitForAnimation(animationId);
  }

  /**
   * Wait for an animation to complete
   */
  private async waitForAnimation(animationId: string): Promise<void> {
    return new Promise((resolve) => {
      const checkAnimation = () => {
        if (animationManager.isAnimationComplete(animationId)) {
          resolve();
        } else {
          requestAnimationFrame(checkAnimation);
        }
      };
      checkAnimation();
    });
  }
}

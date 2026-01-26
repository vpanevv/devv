import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { CoachService } from './coach.service';

export const coachGuard: CanActivateFn = async () => {
    const coachService = inject(CoachService);
    const router = inject(Router);

    const activeId = await coachService.getActiveCoachId();
    console.log('[coachGuard] activeCoachId =', activeId);

    if (!activeId) {
        await router.navigateByUrl('/setup', { replaceUrl: true });
        return false;
    }

    return true;
};
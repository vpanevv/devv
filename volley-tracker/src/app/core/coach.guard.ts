import { CanMatchFn, Router } from '@angular/router';
import { inject } from '@angular/core';
import { Preferences } from '@capacitor/preferences';

const COACH_KEY = 'coachName';

export const coachGuard: CanMatchFn = async () => {
    const router = inject(Router);

    const { value } = await Preferences.get({ key: COACH_KEY });
    const hasName = !!value && value.trim().length > 0;

    return hasName ? true : router.parseUrl('/setup');
};
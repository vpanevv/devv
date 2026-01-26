import { Component } from "@angular/core";
import { Router } from "@angular/router";
import { CommonModule } from "@angular/common";
import { FormsModule } from "@angular/forms";

import {
    IonContent,
    IonButton,
    IonInput,
    IonItem,
    IonLabel,
    IonIcon,
} from "@ionic/angular/standalone";
import { addIcons } from "ionicons";
import { arrowForwardOutline, personCircleOutline } from "ionicons/icons";

@Component({
    selector: "app-setup",
    standalone: true,
    imports: [
        CommonModule,
        FormsModule,
        IonContent,
        IonButton,
        IonInput,
        IonItem,
        IonLabel,
        IonIcon,
    ],
    templateUrl: "./setup.page.html",
    styleUrls: ["./setup.page.scss"],
})
export class SetupPage {
    coachName: string = '';
    isSaving = false;

    constructor(private router: Router) {
        // регистрираме иконите, за да работят в iOS/Android
        addIcons({ arrowForwardOutline, personCircleOutline });
    }

    async continue() {
        const name = (this.coachName || '').trim();
        if (!name) return;

        this.isSaving = true;
        try {
            // TODO: CoachService -> create + setActive
            await this.router.navigateByUrl('/groups');
        } finally {
            this.isSaving = false;
        }
    }
}
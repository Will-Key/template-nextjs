"use client"

import {
  createColumn,
  createCurrencyColumn,
  createDateColumn,
  createBadgeColumn,
  createActionsColumn,
} from "@/lib/column-helpers"
import { formationsService, Formation } from "@/lib/api-service"

import { Pencil, Trash, Eye } from "lucide-react"
import { withDataTable } from "@/components/ui/with-data-table"

// Exemple 1: Page de Formations
export const FormationsPage = withDataTable<Formation>({
  title: "Liste des Formations",
  service: formationsService,
  columns: [
    createColumn<Formation>("label", "Libellé"),
    createColumn<Formation>("days", "Jours"),
    createColumn<Formation>("maxParticipants", "Participants Max"),
    createCurrencyColumn<Formation>("amount", "Montant"),
    createBadgeColumn<Formation>("modules", "Modules", { maxBadges: 2 }),
    createBadgeColumn<Formation>("status", "Statut", {
      variantMap: {
        published: "default",
        draft: "secondary",
        archived: "outline",
      },
    }),
    createDateColumn<Formation>("createdAt", "Date de création"),
    createActionsColumn<Formation>([
      {
        label: "Voir",
        icon: Eye,
        onClick: (formation) => {
          // Naviguer vers la page de détails
          window.location.href = `/formations/${formation.id}`
        },
      },
      {
        label: "Modifier",
        icon: Pencil,
        onClick: (formation) => {
          // La logique de modification est gérée par le HOC
          // Il faut juste retourner l'élément à modifier
          return formation
        },
      },
      {
        label: "Supprimer",
        icon: Trash,
        onClick: async (formation) => {
          if (
            confirm(`Êtes-vous sûr de vouloir supprimer ${formation.label} ?`)
          ) {
            try {
              await formationsService.delete(formation.id)
              alert("Formation supprimée avec succès")
              // Le rechargement est géré par le HOC
              window.location.reload()
              // eslint-disable-next-line @typescript-eslint/no-unused-vars
            } catch (error) {
              alert("Erreur lors de la suppression")
            }
          }
        },
      },
    ]),
  ],
  searchColumn: "label",
  searchPlaceholder: "Rechercher une formation...",
  emptyMessage:
    "Aucune formation disponible. Créez votre première formation en cliquant sur le bouton ci-dessus.",
  createButtonLabel: "Nouvelle Formation",
  editTitle: "Modifier la formation",
  createTitle: "Créer une formation",
  dialogWidth: "md",
})

// Exemple 2: Page d'Utilisateurs
// export const UsersPage = withDataTable<User>({
//   title: "Liste des Utilisateurs",
//   service: usersService,
//   columns: [
//     createColumn<User>("name", "Nom"),
//     createColumn<User>("personnelNumber", "Matricule"),
//     createBadgeColumn<User>("role", "Rôle", {
//       variantMap: {
//         admin: "destructive",
//         manager: "default",
//         user: "outline",
//       },
//     }),
//     createBadgeColumn<User>("status", "Statut", {
//       variantMap: {
//         active: "default",
//         inactive: "outline",
//       },
//     }),
//     createDateColumn<User>("lastLogin", "Dernière connexion", {
//       dateStyle: "medium",
//       timeStyle: "short",
//     }),
//     createActionsColumn<User>([
//       {
//         label: "Voir",
//         icon: Eye,
//         onClick: (user) => {
//           window.location.href = `/users/${user.id}`;
//         },
//       },
//       {
//         label: "Modifier",
//         icon: Pencil,
//         onClick: (user) => {
//           return user;
//         },
//       },
//       {
//         label: "Supprimer",
//         icon: Trash,
//         onClick: async (user) => {
//           if (confirm(`Êtes-vous sûr de vouloir supprimer ${user.name} ?`)) {
//             try {
//               await usersService.delete(user.id);
//               alert("Utilisateur supprimé avec succès");
//               window.location.reload();
//             } catch (error) {
//               alert("Erreur lors de la suppression");
//             }
//           }
//         },
//       },
//     ]),
//   ],
//   searchColumn: "name",
//   searchPlaceholder: "Rechercher un utilisateur...",
//   FormComponent: UserForm,
//   createButtonLabel: "Nouvel Utilisateur",
//   dialogWidth: "lg",
// });

// Vous pouvez ensuite utiliser ces composants dans votre application Next.js
// Par exemple:
// app/formations/page.tsx
// export default FormationsPage;

// app/users/page.tsx
// export default UsersPage;

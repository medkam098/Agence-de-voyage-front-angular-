export interface Voyage {
    id: number;
    datevoyage: string;
    nbplacetotal: number;
    prixplace: number;
    depart: string;
    destination_id: number;
    destinationNom?: string; // Ajout du nom de la destination

    
  }
  
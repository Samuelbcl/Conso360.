# Cadre réglementaire belge — repères

> ⚠️ **Ceci n'est pas un avis juridique.** Ce sont des repères de cadrage pour concevoir le produit sans se mettre en infraction. À faire valider par un juriste / un conseil spécialisé belge **avant tout lancement commercial**, en particulier pour la Formule 3 (courtage).

## 1. Assurances — le point le plus sensible

- Le **courtage en assurance** est une activité **réglementée par la FSMA** (Autorité des services et marchés financiers). Distribuer / conseiller des contrats d'assurance contre rémunération suppose en principe un **agrément / une inscription FSMA** (ou agir sous la responsabilité d'un intermédiaire agréé).
- **Comparer** des offres et **mettre en relation** n'est pas automatiquement du courtage, mais la frontière dépend de ce qu'on fait concrètement (conseil personnalisé, intermédiation rémunérée…).
- **Implication produit** : tant que l'agrément n'est pas réglé, **ne pas se présenter comme courtier**, rester « comparateur + information + mise en relation ». La gestion du changement de contrat d'assurance en Formule 3 doit soit passer par un **partenaire courtier agréé**, soit attendre l'agrément.

## 2. Énergie

- Marché libéralisé, régulé par la **CREG** (fédéral) + régulateurs régionaux : **CWaPE** (Wallonie), **VREG** (Flandre), **Brugel** (Bruxelles).
- Des **comparateurs officiels** existent (ex. CompaCWaPE, V-test, Brusim). Notre valeur n'est pas d'être une autorité tarifaire mais un **service de suivi continu + accompagnement**.
- Pas d'agrément spécifique pour un simple comparateur, mais transparence et exactitude des données sont attendues.

## 3. Télécom

- Régulateur : **BIPT / IBPT**. Comparateur officiel : meilleurtarif.be / bestetarief.be.
- Même logique : on se différencie par le suivi et la personnalisation, pas par l'exhaustivité brute.

## 4. RGPD / vie privée

Données traitées potentiellement sensibles (factures, consommation, contrats, coordonnées). Obligations clés :
- **Base légale** claire (consentement / exécution du contrat).
- **Minimisation** : ne collecter que le nécessaire.
- **Consentement explicite** pour l'upload de factures et l'analyse.
- **Droit d'accès / rectification / effacement** + export.
- **Hébergement EU** : configurer Supabase en **région européenne**.
- **Registre des traitements** + politique de confidentialité + DPA avec sous-traitants (Supabase, Stripe, service OCR…).

## 5. Affiliation / transparence

- Si on touche une **commission** sur un changement de fournisseur, l'utilisateur doit en être **informé clairement** (transparence des comparateurs / pratiques commerciales loyales).
- Le classement affiché ne doit pas être biaisé par la commission sans le signaler.

## 6. Divers
- **Mentions légales / CGU / politique cookies** obligatoires.
- Si paiement d'abonnements : facturation TVA correcte (entreprise belge).
- Conserver une trace de la **source et de la date** des tarifs affichés (preuve + fiabilité).

---

### Check-list avant lancement
- [ ] Statut FSMA clarifié (agrément propre ou partenaire courtier) si on fait de l'intermédiation assurance rémunérée
- [ ] Politique de confidentialité + registre RGPD rédigés
- [ ] Supabase confirmé en région EU
- [ ] Transparence affiliation affichée dans l'UI
- [ ] CGU / mentions légales / cookies en ligne
- [ ] Validation par un juriste belge

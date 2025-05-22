import React, { forwardRef, useEffect, useState } from "react";
import { Calendar } from "lucide-react";
import { Button } from "@/components/ui/button";

interface DatePickerProps {
  /**
   * Fonction appelée lorsqu'une date est sélectionnée
   */
  onChange?: (date: Date | null) => void;
  /**
   * Date initiale (optionnelle)
   */
  value?: Date | null;
  /**
   * Texte d'espace réservé lorsqu'aucune date n'est sélectionnée
   */
  placeholder?: string;
  /**
   * Classes CSS supplémentaires pour le conteneur principal
   */
  className?: string;
  /**
   * Désactiver certaines dates (fonction de prédicat)
   */
  isDateDisabled?: (date: Date) => boolean;
  /**
   * Nom du champ (pour l'accessibilité et les formulaires)
   */
  name?: string;
  /**
   * ID unique pour le champ
   */
  id?: string;
  /**
   * Indique si le champ est désactivé
   */
  disabled?: boolean;
}

// Utiliser forwardRef pour permettre à React Hook Form d'accéder à la référence du composant
const DatePicker = forwardRef<HTMLInputElement, DatePickerProps>(
  (
    {
      onChange,
      value = null,
      placeholder = "Sélectionner une date",
      className = "",
      isDateDisabled = () => false,
      name,
      id,
      disabled = false,
    },
    ref
  ) => {
    const [date, setDate] = useState<Date | null>(value);
    const [isOpen, setIsOpen] = useState<boolean>(false);
    const [currentMonth, setCurrentMonth] = useState<Date>(value || new Date());

    // Synchroniser l'état local avec la prop value
    useEffect(() => {
      setDate(value);
    }, [value]);

    // Options pour formatter la date en français
    const dateFormatter = new Intl.DateTimeFormat("fr-FR", {
      day: "numeric",
      month: "long",
      year: "numeric",
    });

    const monthFormatter = new Intl.DateTimeFormat("fr-FR", {
      month: "long",
      year: "numeric",
    });

    const handleDateSelect = (selectedDate: Date): void => {
      setDate(selectedDate);
      setIsOpen(false);
      if (onChange) {
        onChange(selectedDate);
      }
    };

    const handleClear = (e: React.MouseEvent): void => {
      e.stopPropagation();
      setDate(null);
      if (onChange) {
        onChange(null);
      }
    };

    const toggleCalendar = (): void => {
      if (!disabled) {
        setIsOpen(!isOpen);
      }
    };

    const goToPreviousMonth = (): void => {
      setCurrentMonth(
        new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1, 1)
      );
    };

    const goToNextMonth = (): void => {
      setCurrentMonth(
        new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 1)
      );
    };

    // Générer les jours du mois actuel
    const generateCalendarDays = (): (Date | null)[] => {
      const year = currentMonth.getFullYear();
      const month = currentMonth.getMonth();

      // Obtenir le premier jour du mois
      const firstDay = new Date(year, month, 1);
      // Obtenir le nombre de jours dans le mois
      const lastDay = new Date(year, month + 1, 0);
      const daysInMonth = lastDay.getDate();

      // Obtenir le jour de la semaine du premier jour (0 = dimanche, 1 = lundi, etc.)
      let firstDayOfWeek = firstDay.getDay();
      // Convertir pour que la semaine commence le lundi (0 = lundi, 6 = dimanche)
      firstDayOfWeek = firstDayOfWeek === 0 ? 6 : firstDayOfWeek - 1;

      // Créer un tableau pour tous les jours du mois
      const days: (Date | null)[] = [];

      // Ajouter des espaces vides pour les jours avant le premier jour du mois
      for (let i = 0; i < firstDayOfWeek; i++) {
        days.push(null);
      }

      // Ajouter tous les jours du mois
      for (let i = 1; i <= daysInMonth; i++) {
        days.push(new Date(year, month, i));
      }

      return days;
    };

    // Vérifier si une date est aujourd'hui
    const isToday = (someDate: Date): boolean => {
      const today = new Date();
      return (
        someDate.getDate() === today.getDate() &&
        someDate.getMonth() === today.getMonth() &&
        someDate.getFullYear() === today.getFullYear()
      );
    };

    // Vérifier si une date est sélectionnée
    const isSelected = (someDate: Date): boolean => {
      if (!date) return false;
      return (
        someDate.getDate() === date.getDate() &&
        someDate.getMonth() === date.getMonth() &&
        someDate.getFullYear() === date.getFullYear()
      );
    };

    return (
      <div className={`relative w-full ${className}`}>
        {/* Input caché pour React Hook Form */}
        <input
          type="hidden"
          ref={ref}
          name={name}
          id={id}
          value={date ? date.toISOString() : ""}
          disabled={disabled}
        />

        <Button
          onClick={toggleCalendar}
          disabled={disabled}
          className={`flex items-center justify-between w-full px-4 py-2 text-left border rounded-md
          ${
            disabled
              ? "bg-gray-100 cursor-not-allowed opacity-70"
              : "hover:bg-gray-50"
          }`}
        >
          <div className="flex items-center">
            <Calendar className="mr-2 h-4 w-4" />
            <span className={date ? "text-gray-900" : "text-gray-400"}>
              {date ? dateFormatter.format(date) : placeholder}
            </span>
          </div>

          {date && !disabled && (
            <Button
              onClick={handleClear}
              className="text-gray-400 hover:text-gray-600"
            >
              ×
            </Button>
          )}
        </Button>

        {isOpen && !disabled && (
          <div className="absolute mt-1 w-full border rounded-md shadow-lg bg-white z-10">
            <div className="p-2">
              {/* En-tête du calendrier avec navigation */}
              <div className="flex items-center justify-between mb-2 px-2">
                <Button
                  onClick={goToPreviousMonth}
                  className="p-1 hover:bg-gray-100 rounded-full"
                >
                  &lt;
                </Button>
                <div className="font-medium">
                  {monthFormatter.format(currentMonth)}
                </div>
                <Button
                  onClick={goToNextMonth}
                  className="p-1 hover:bg-gray-100 rounded-full"
                >
                  &gt;
                </Button>
              </div>

              {/* Jours de la semaine */}
              <div className="grid grid-cols-7 gap-1 mb-1">
                {["Lu", "Ma", "Me", "Je", "Ve", "Sa", "Di"].map((day) => (
                  <div
                    key={day}
                    className="text-center text-xs font-medium text-gray-500 py-1"
                  >
                    {day}
                  </div>
                ))}
              </div>

              {/* Jours du mois */}
              <div className="grid grid-cols-7 gap-1">
                {generateCalendarDays().map((day, index) => (
                  <div
                    key={index}
                    className="h-8 w-8 flex items-center justify-center"
                  >
                    {day ? (
                      <Button
                        disabled={isDateDisabled(day)}
                        className={`h-7 w-7 flex items-center justify-center rounded-full 
                        ${
                          isSelected(day)
                            ? "bg-blue-600 text-white"
                            : isToday(day)
                            ? "bg-blue-100 text-blue-600"
                            : "hover:bg-gray-100"
                        }
                        ${
                          isDateDisabled(day)
                            ? "opacity-50 cursor-not-allowed"
                            : ""
                        }
                      `}
                        onClick={() =>
                          !isDateDisabled(day) && handleDateSelect(day)
                        }
                      >
                        {day.getDate()}
                      </Button>
                    ) : (
                      <span></span>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    );
  }
);

DatePicker.displayName = "DatePicker";

export default DatePicker;

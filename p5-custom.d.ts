// Extend the p5 namespace
declare namespace p5 {
    class Select extends Element {
      /**
       * Adds an option to the dropdown.
       * @param value - The value of the option.
       * @param label - (Optional) The label of the option.
       */
      option(value: string, label?: string): this;
  
      /**
       * Gets the current value of the dropdown.
       */
      value(): string;
  
      /**
       * Sets the selected value of the dropdown.
       * @param value - The value to select.
       */
      selected(value: string): void;
    }
  
    /**
     * Creates a dropdown menu (select HTML element).
     */
    function createSelect(): Select;
  }
  
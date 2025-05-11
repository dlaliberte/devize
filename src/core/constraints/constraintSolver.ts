/**
 * Constraint Solver
 *
 * Purpose: Provides a general-purpose constraint solving system for layout and positioning
 * Author: Cody
 * Creation Date: 2023-11-20
 */

// Types of constraints
export enum ConstraintType {
  EQUAL,           // a = b
  LESS_EQUAL,      // a <= b
  GREATER_EQUAL,   // a >= b
  FIXED,           // a = constant
  MINIMIZE,        // minimize a
  MAXIMIZE         // maximize a
}

// A variable in the constraint system
export class Variable {
  id: string;
  value: number;
  min: number;
  max: number;

  constructor(id: string, initialValue: number = 0, min: number = -Infinity, max: number = Infinity) {
    this.id = id;
    this.value = initialValue;
    this.min = min;
    this.max = max;
  }
}

// A constraint in the system
export class Constraint {
  type: ConstraintType;
  variables: Variable[];
  coefficients: number[];
  constant: number;
  strength: number; // 0 to 1, with 1 being required

  constructor(
    type: ConstraintType,
    variables: Variable[],
    coefficients: number[],
    constant: number = 0,
    strength: number = 1
  ) {
    this.type = type;
    this.variables = variables;
    this.coefficients = coefficients;
    this.constant = constant;
    this.strength = strength;

    // Validate
    if (variables.length !== coefficients.length) {
      throw new Error('Number of variables must match number of coefficients');
    }
  }

  // Evaluate the left side of the constraint
  evaluate(): number {
    return this.variables.reduce(
      (sum, variable, index) => sum + variable.value * this.coefficients[index],
      0
    );
  }

  // Check if the constraint is satisfied
  isSatisfied(): boolean {
    const value = this.evaluate();

    switch (this.type) {
      case ConstraintType.EQUAL:
        return Math.abs(value - this.constant) < 1e-6;
      case ConstraintType.LESS_EQUAL:
        return value <= this.constant;
      case ConstraintType.GREATER_EQUAL:
        return value >= this.constant;
      case ConstraintType.FIXED:
        return Math.abs(this.variables[0].value - this.constant) < 1e-6;
      // MINIMIZE and MAXIMIZE are objective functions, not constraints
      default:
        return true;
    }
  }
}

// The constraint solver
export class ConstraintSolver {
  variables: Map<string, Variable> = new Map();
  constraints: Constraint[] = [];

  // Add a variable to the system
  addVariable(variable: Variable): Variable {
    this.variables.set(variable.id, variable);
    return variable;
  }

  // Create and add a variable
  createVariable(id: string, initialValue: number = 0, min: number = -Infinity, max: number = Infinity): Variable {
    const variable = new Variable(id, initialValue, min, max);
    return this.addVariable(variable);
  }

  // Add a constraint to the system
  addConstraint(constraint: Constraint): Constraint {
    this.constraints.push(constraint);
    return constraint;
  }

  // Create and add an equality constraint: sum(vars * coeffs) = constant
  createEqualConstraint(
    variables: Variable[],
    coefficients: number[],
    constant: number,
    strength: number = 1
  ): Constraint {
    const constraint = new Constraint(
      ConstraintType.EQUAL,
      variables,
      coefficients,
      constant,
      strength
    );
    return this.addConstraint(constraint);
  }

  // Create and add a less-than-or-equal constraint: sum(vars * coeffs) <= constant
  createLessEqualConstraint(
    variables: Variable[],
    coefficients: number[],
    constant: number,
    strength: number = 1
  ): Constraint {
    const constraint = new Constraint(
      ConstraintType.LESS_EQUAL,
      variables,
      coefficients,
      constant,
      strength
    );
    return this.addConstraint(constraint);
  }

  // Create and add a greater-than-or-equal constraint: sum(vars * coeffs) >= constant
  createGreaterEqualConstraint(
    variables: Variable[],
    coefficients: number[],
    constant: number,
    strength: number = 1
  ): Constraint {
    const constraint = new Constraint(
      ConstraintType.GREATER_EQUAL,
      variables,
      coefficients,
      constant,
      strength
    );
    return this.addConstraint(constraint);
  }

  // Create and add a fixed value constraint: var = constant
  createFixedConstraint(
    variable: Variable,
    constant: number,
    strength: number = 1
  ): Constraint {
    const constraint = new Constraint(
      ConstraintType.FIXED,
      [variable],
      [1],
      constant,
      strength
    );
    return this.addConstraint(constraint);
  }

  // Solve the constraint system
  solve(): boolean {
    // Sort constraints by strength (required constraints first)
    const sortedConstraints = [...this.constraints].sort((a, b) => b.strength - a.strength);

    // For this simple implementation, we'll use a basic iterative approach
    // In a real implementation, you'd use a more sophisticated algorithm like Cassowary

    const MAX_ITERATIONS = 100;
    let iterations = 0;
    let satisfied = false;

    while (!satisfied && iterations < MAX_ITERATIONS) {
      satisfied = true;

      for (const constraint of sortedConstraints) {
        if (!constraint.isSatisfied()) {
          satisfied = false;
          this.adjustVariablesToSatisfyConstraint(constraint);
        }
      }

      iterations++;
    }

    return satisfied;
  }

  // Adjust variables to try to satisfy a constraint
  private adjustVariablesToSatisfyConstraint(constraint: Constraint): void {
    // This is a very simplified approach - a real solver would be more sophisticated

    switch (constraint.type) {
      case ConstraintType.FIXED:
        // For fixed constraints, just set the variable to the constant
        constraint.variables[0].value = constraint.constant;
        break;

      case ConstraintType.EQUAL:
        // For equality constraints, distribute the difference among variables
        const currentValue = constraint.evaluate();
        const diff = constraint.constant - currentValue;

        if (Math.abs(diff) < 1e-6) return; // Already satisfied

        // Find adjustable variables (not at their bounds)
        const adjustableVars = constraint.variables.filter((v, i) => {
          const coeff = constraint.coefficients[i];
          return (coeff > 0 && v.value < v.max) || (coeff < 0 && v.value > v.min);
        });

        if (adjustableVars.length === 0) return; // Can't adjust any variables

        // Distribute the difference among adjustable variables
        const adjustPerVar = diff / adjustableVars.length;

        for (let i = 0; i < constraint.variables.length; i++) {
          const variable = constraint.variables[i];
          const coeff = constraint.coefficients[i];

          if ((coeff > 0 && variable.value < variable.max) ||
              (coeff < 0 && variable.value > variable.min)) {
            // Adjust the variable
            const adjustment = adjustPerVar / coeff;
            variable.value = Math.max(variable.min, Math.min(variable.max, variable.value + adjustment));
          }
        }
        break;

      case ConstraintType.LESS_EQUAL:
        // If the constraint is violated, reduce variables to satisfy it
        if (constraint.evaluate() > constraint.constant) {
          const excess = constraint.evaluate() - constraint.constant;

          // Find variables with positive coefficients that can be reduced
          const reducibleVars = constraint.variables.filter((v, i) =>
            constraint.coefficients[i] > 0 && v.value > v.min
          );

          if (reducibleVars.length === 0) return; // Can't reduce any variables

          // Distribute the excess among reducible variables
          const reducePerVar = excess / reducibleVars.length;

          for (let i = 0; i < constraint.variables.length; i++) {
            const variable = constraint.variables[i];
            const coeff = constraint.coefficients[i];

            if (coeff > 0 && variable.value > variable.min) {
              // Reduce the variable
              const reduction = reducePerVar / coeff;
              variable.value = Math.max(variable.min, variable.value - reduction);
            }
          }
        }
        break;

      case ConstraintType.GREATER_EQUAL:
        // If the constraint is violated, increase variables to satisfy it
        if (constraint.evaluate() < constraint.constant) {
          const shortfall = constraint.constant - constraint.evaluate();

          // Find variables with positive coefficients that can be increased
          const increasableVars = constraint.variables.filter((v, i) =>
            constraint.coefficients[i] > 0 && v.value < v.max
          );

          if (increasableVars.length === 0) return; // Can't increase any variables

          // Distribute the shortfall among increasable variables
          const increasePerVar = shortfall / increasableVars.length;

          for (let i = 0; i < constraint.variables.length; i++) {
            const variable = constraint.variables[i];
            const coeff = constraint.coefficients[i];

            if (coeff > 0 && variable.value < variable.max) {
              // Increase the variable
              const increase = increasePerVar / coeff;
              variable.value = Math.min(variable.max, variable.value + increase);
            }
          }
        }
        break;
    }
  }

  // Get the current value of a variable
  getVariableValue(id: string): number | undefined {
    return this.variables.get(id)?.value;
  }

  // Reset all variables to their initial values
  reset(): void {
    for (const variable of this.variables.values()) {
      variable.value = 0;
    }
  }

  // Clear all constraints and variables
  clear(): void {
    this.constraints = [];
    this.variables.clear();
  }
}

/** extra credit
  // Create a layout constraint system for a box layout
  createBoxLayoutConstraints(
    items: Array<{ id: string, width: number, height: number }>,
    options: {
      direction: 'horizontal' | 'vertical',
      spacing: number,
      padding: { top: number, right: number, bottom: number, left: number },
      align: 'start' | 'center' | 'end' | 'stretch',
      justify: 'start' | 'center' | 'end' | 'space-between' | 'space-around' | 'space-evenly',
      containerWidth?: number,
      containerHeight?: number
    }
  ): { [id: string]: { x: Variable, y: Variable, width: Variable, height: Variable } } {
    const {
      direction,
      spacing,
      padding,
      align,
      justify,
      containerWidth,
      containerHeight
    } = options;

    const isHorizontal = direction === 'horizontal';
    const itemVariables: { [id: string]: { x: Variable, y: Variable, width: Variable, height: Variable } } = {};

    // Create variables for each item
    items.forEach(item => {
      itemVariables[item.id] = {
        x: this.createVariable(`${item.id}_x`, 0),
        y: this.createVariable(`${item.id}_y`, 0),
        width: this.createVariable(`${item.id}_width`, item.width, 0),
        height: this.createVariable(`${item.id}_height`, item.height, 0)
      };
    });

    // Create container variables if dimensions are provided
    const containerWidthVar = containerWidth !== undefined
      ? this.createVariable('container_width', containerWidth, containerWidth, containerWidth)
      : undefined;

    const containerHeightVar = containerHeight !== undefined
      ? this.createVariable('container_height', containerHeight, containerHeight, containerHeight)
      : undefined;

    // Apply padding constraints
    if (isHorizontal) {
      // Horizontal layout - items are arranged in a row
      let prevItem: string | null = null;

      // Set initial position (after left padding)
      for (const item of items) {
        const itemVars = itemVariables[item.id];

        // X position constraints
        if (prevItem === null) {
          // First item starts at left padding
          this.createFixedConstraint(itemVars.x, padding.left);
        } else {
          // Other items positioned after previous item + spacing
          const prevItemVars = itemVariables[prevItem];
          this.createEqualConstraint(
            [prevItemVars.x, prevItemVars.width, itemVars.x],
            [1, 1, -1],
            spacing
          );
        }

        // Y position constraints based on alignment
        if (align === 'start') {
          this.createFixedConstraint(itemVars.y, padding.top);
        } else if (align === 'end' && containerHeightVar) {
          this.createEqualConstraint(
            [itemVars.y, itemVars.height],
            [1, 1],
            containerHeight! - padding.bottom
          );
        } else if (align === 'center' && containerHeightVar) {
          this.createEqualConstraint(
            [itemVars.y, itemVars.height, containerHeightVar],
            [2, 1, -1],
            -padding.top - padding.bottom
          );
        } else if (align === 'stretch' && containerHeightVar) {
          this.createFixedConstraint(itemVars.y, padding.top);
          this.createEqualConstraint(
            [itemVars.height, containerHeightVar],
            [1, -1],
            -padding.top - padding.bottom
          );
        }

        prevItem = item.id;
      }

      // Apply justification constraints
      if (containerWidthVar && items.length > 0) {
        const lastItem = items[items.length - 1];
        const lastItemVars = itemVariables[lastItem.id];

        // Total content width
        const contentWidthVar = this.createVariable('content_width');
        this.createEqualConstraint(
          [lastItemVars.x, lastItemVars.width, contentWidthVar],
          [1, 1, -1],
          -padding.left
        );

        // Available space
        const availableSpaceVar = this.createVariable('available_space');
        this.createEqualConstraint(
          [containerWidthVar, contentWidthVar, availableSpaceVar],
          [1, -1, -1],
          -padding.left - padding.right
        );

        // Apply justification
        if (justify === 'center' || justify === 'space-around' || justify === 'space-evenly') {
          // Calculate spacing to distribute
          const spacingVar = this.createVariable('spacing');

          if (justify === 'center') {
            this.createEqualConstraint([availableSpaceVar, spacingVar], [1, -2], 0);
          } else if (justify === 'space-around') {
            this.createEqualConstraint(
              [available

              */

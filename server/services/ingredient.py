class Ingredient:
    def __init__(self, name, unit, quantity=None, confidence=None):
        self.name = name
        self.unit = unit
        self.quantity = quantity
    def to_dict(self):
        return {
            "name": self.name,
            "unit": self.unit,
            "quantity": self.quantity,
        }   
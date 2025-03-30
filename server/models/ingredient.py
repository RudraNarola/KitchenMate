class Ingredient:
    def __init__(self, name, unit, quantity=None, confidence=None, spoiled=False):
        self.name = name
        self.unit = unit
        self.quantity = quantity
        self.confidence = confidence
        self.spoiled = spoiled
        
    def to_dict(self):
        result = {
            "name": self.name,
            "unit": self.unit,
            "quantity": self.quantity,
            "spoiled": self.spoiled
        }
        
        if self.confidence is not None:
            result["confidence"] = self.confidence
            
        return result
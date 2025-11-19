from cuid2 import Cuid

def generate_cuid() -> str:
    """Generate a new CUID (Collision-resistant Unique Identifier)."""
    return Cuid().generate()
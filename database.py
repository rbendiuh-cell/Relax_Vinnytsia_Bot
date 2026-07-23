import pandas as pd

FILE = "data/places.csv"


def load_places():
    df = pd.read_csv(FILE)

    # Замінюємо порожні клітинки
    df = df.fillna("")

    # Перетворюємо DataFrame у список словників
    return df.to_dict(orient="records")


def get_all_places():
    return load_places()


def get_by_column(column, value="так"):
    places = load_places()

    result = []

    for place in places:
        if str(place.get(column, "")).strip().lower() == value.lower():
            result.append(place)

    return result


def get_place_by_name(name):
    places = load_places()

    for place in places:
        if str(place.get("Назва", "")).strip() == str(name).strip():
            return place

    return None


def get_place_by_id(place_id):
    places = load_places()

    for place in places:
        if str(place.get("ID")) == str(place_id):
            return place

    return None


def search_place(text):
    text = text.lower().strip()

    result = []

    for place in load_places():
        if text in str(place.get("Назва", "")).lower():
            result.append(place)

    return result
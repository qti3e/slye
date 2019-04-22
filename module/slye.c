/**
 *    _____ __
 *   / ___// /_  _____
 *   \__ \/ / / / / _ \
 *  ___/ / / /_/ /  __/
 * /____/_/\__, /\___/
 *       /____/
 *       Copyright 2019 Parsa Ghadimi. All Rights Reserved.
 */

// This technique is used to have type checking for our
// functions.
typedef int string_ref_t;
typedef int font_ref_t;
typedef int font_layout_t;
typedef int geometry_t;
typedef int material_t;
typedef int obj3d_t;
typedef int asset_ref_t;
typedef int obj_t;

static const int THREE_FRONT_SIDE = 0;
static const int THREE_BACK_SIDE = 1;
static const int THREE_DOUBLE_SIDE = 2;

extern void register_component(char *name, void init());
extern void slog(char *msg);
extern asset_ref_t load_local(char *asset);
extern void register_font(char *name, asset_ref_t asset);
extern void on_render(void render(int));
extern void on_click(void click());
extern obj_t new_obj();
extern void obj_set_string(obj_t o, char *key, string_ref_t str);
extern void obj_set_char(obj_t o, char *key, char *str);
extern void obj_set_num(obj_t o, char *key, int value);
extern string_ref_t get_string_prop_ref(char *key);
extern font_ref_t get_font_prop_ref(char *key);
extern asset_ref_t get_ab_prop_ref(char *key);
extern float get_prop(char *key);
extern font_layout_t font_layout(font_ref_t font, string_ref_t text);
extern geometry_t generate_text_geometry(font_layout_t layout, float size,
                float steps, float depth, int bevel_enabled,
                int bevel_thickness, int bevel_size, int bevel_segments);

extern void add_obj(obj3d_t obj);
extern obj3d_t picture(asset_ref_t img, float width, float height);

extern material_t three_mesh_basic_material(obj_t props);
extern material_t three_mesh_phong_material(obj_t props);
extern void three_material_set(material_t m, char *key, float value);
extern obj3d_t three_point_light(int color, float intensity, float distance);
extern void three_set_position(obj3d_t obj, float x, float y, float z);
extern void three_set_rotation(obj3d_t obj, float x, float y, float z);
extern obj3d_t three_mesh(geometry_t geo, material_t material);

void picture_init()
{
        asset_ref_t ab = get_ab_prop_ref("img");
        float width = get_prop("width");
        float height = get_prop("height");

        obj3d_t obj = picture(ab, width, height);

        add_obj(obj);
}

void text_init()
{
        float size = get_prop("size");
        if (!size) size = 5;
        font_ref_t font = get_font_prop_ref("font");
        string_ref_t str = get_string_prop_ref("text");
        font_layout_t layout = font_layout(font, str);
        geometry_t geo = generate_text_geometry(layout, size, 2, 1, 0, 1, 1, 1);

        obj_t mp = new_obj();
        obj_set_num(mp, "color", 0x896215);
        obj_set_num(mp, "emissive", 0x4e2e11);
        obj_set_num(mp, "flatShading", 1);
        obj_set_num(mp, "side", THREE_DOUBLE_SIDE);

        material_t material = three_mesh_phong_material(mp);

        obj3d_t mesh = three_mesh(geo, material);
        add_obj(mesh);
}

void template()
{
        obj3d_t lights[3];
        lights[0] = three_point_light(0xffffff, 1, 0);
        lights[1] = three_point_light(0xffffff, 1, 0);
        lights[2] = three_point_light(0xffffff, 1, 0);

        three_set_position(lights[0], 0, 400, 0);
        three_set_position(lights[1], 200, 400, 200);
        three_set_position(lights[2], -200, -400, -200);

        add_obj(lights[0]);
        add_obj(lights[1]);
        add_obj(lights[2]);
}

int init()
{
        register_font("homa", load_local("homa.ttf"));
        register_font("emoji", load_local("emoji.ttf"));
        register_font("sahel", load_local("sahel.ttf"));
        register_font("shellia", load_local("shellia.ttf"));

        register_component("template", template);
        register_component("text", text_init);
        register_component("picture", picture_init);

        return 0;
}

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

extern void register_component(char *name, void init());
extern void slog(char *msg);
extern asset_ref_t load_local(char *asset);
extern void register_font(char *name, asset_ref_t asset);
extern void on_render(void render(int));
extern void on_click(void click());
extern string_ref_t get_string_prop_ref(char *key);
extern font_ref_t get_font_prop_ref(char *key);
extern int get_prop(char *key);
extern font_layout_t font_layout(font_ref_t font, string_ref_t text);
extern geometry_t generate_text_geometry(font_layout_t layout, int size,
                float steps, float depth, int bevel_enabled,
                int bevel_thickness, int bevel_size, int bevel_segments);
extern void add_obj(obj3d_t obj);

extern material_t three_mesh_basic_material(int color);
extern void three_material_set(material_t m, char *key, float value);
extern obj3d_t three_point_light(int color, float intensity, float distance);
extern void three_set_position(obj3d_t obj, float x, float y, float z);
extern void three_set_rotation(obj3d_t obj, float x, float y, float z);
extern obj3d_t three_mesh(geometry_t geo, material_t material);

void text_init()
{
        slog("Hey!");

        font_ref_t font = get_font_prop_ref("font");
        string_ref_t str = get_string_prop_ref("text");
        font_layout_t layout = font_layout(font, str);
        geometry_t geo = generate_text_geometry(layout, 5, 2, 2, 0, 1, 1, 1);

        material_t material = three_mesh_basic_material(0x156289);
        /*three_material_set(material, "emissive", 0x072534);*/
        /*three_material_set(material, "flatShading", 1);*/

        obj3d_t mesh = three_mesh(geo, material);
        add_obj(mesh);
}

void template()
{
        slog("Template!!!");

        obj3d_t l1 = three_point_light(0xffffff, 1, 0);
        obj3d_t l2 = three_point_light(0xffffff, 1, 0);
        obj3d_t l3 = three_point_light(0xffffff, 1, 0);

        three_set_position(l1, 0, 200, 0);
        three_set_position(l2, 100, 200, 100);
        three_set_position(l3, -100, -200, -100);

        add_obj(l1);
        add_obj(l2);
        add_obj(l3);
}

int init()
{
        register_font("homa", load_local("homa.ttf"));
        register_font("emoji", load_local("emoji.ttf"));
        register_font("sahel", load_local("sahel.ttf"));

        register_component("text", text_init);
        register_component("template", template);

        return 0;
}

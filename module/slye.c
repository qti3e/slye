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
typedef struct {} string_ref_t;
typedef struct {} font_ref_t;
typedef struct {} font_layout_t;
typedef struct {} geometry_t;
typedef struct {} material_t;
typedef struct {} obj3d_t;
typedef struct {} asset_ref_t;

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
extern geometry_t generate_text_geometry(font_layout_t font, float steps, float depth,
                int bevel_enabled, int bevel_thickness, int bevel_size,
                int bevel_segments);
extern void add_obj(obj3d_t obj);

extern material_t three_mesh_basic_material(int color);
extern void three_material_set(material_t m, char *key, float value);
extern obj3d_t three_point_light(int color, float intensity, float distance);
extern void three_set_position(obj3d_t obj, float x, float y, float z);
extern void three_set_rotation(obj3d_t obj, float x, float y, float z);
extern void three_mesh(geometry_t geo, material_t material);

void text_init()
{
        slog("Hey!");
}

int init()
{
        register_font("homa", load_local("homa.ttf"));
        register_font("emoji", load_local("emoji.ttf"));
        register_font("sahel", load_local("sahel.ttf"));

        register_component("text", text_init);

        return 0;
}

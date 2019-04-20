/**
 *    _____ __
 *   / ___// /_  _____
 *   \__ \/ / / / / _ \
 *  ___/ / / /_/ /  __/
 * /____/_/\__, /\___/
 *       /____/
 *       Copyright 2019 Parsa Ghadimi. All Rights Reserved.
 */

extern void register_component(char *name, void init());
extern void slog(char *msg);
extern int load_local(char *asset);
extern void register_font(char *name, int asset_ref);
extern void on_render(void render(int));
extern void on_click(void click());

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

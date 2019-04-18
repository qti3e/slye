extern void register_component();

void component_a(int id)
{
        char text[256];

        get_str_prop(&text, "text", 256);
}

int slye_init()
{
        register_component("A");
}

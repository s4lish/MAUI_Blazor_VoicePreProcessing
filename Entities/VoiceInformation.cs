using SQLite;

namespace Entities
{
    public class VoiceInformation
    {
        [PrimaryKey, AutoIncrement, Column("_id")]
        public long Id { get; set; }
        [MaxLength(100)]
        public string VoiceFile { get; set; } = string.Empty;
        public DateTime CreateAt { get; set; } = DateTime.Now;
        public bool IsDeleted { get; set; } = false;
    }
}
